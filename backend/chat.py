    #Importing the libraries
import nltk
import pickle
import numpy as np
import json
import random
from nltk.stem import WordNetLemmatizer
from keras.models import load_model

#Importing the model and the dataset
lemma = WordNetLemmatizer()
model = load_model('model.h5')
intents = json.loads(open('intents.json').read())
words = pickle.load(open('word.pkl','rb'))
classes = pickle.load(open('class.pkl','rb'))

#Cleaning the sentence
def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemma.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

#Creating the bag of words
def bow(sentence, words, show_details=True):
    sentence_words = clean_up_sentence(sentence)
    bag = np.zeros(len(words), dtype=np.float32)
    for word in sentence_words:
        for i, w in enumerate(words):
            if w == word:
                bag[i] = 1
                if show_details:
                    print("Found '{w}' in bag")
    return bag

#Predicting the class
def predict_class(sentence, model):
    p = bow(sentence, words, show_details=False)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [(i, r) for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]
    return return_list

#Getting the response
def get_response(ints, intents_json):
    tag = ints[0]['intent']
    for i in intents_json['intents']:
        if i['tag'] == tag:
            return random.choice(i['responses'])
    return 'Sorry, I am not able to understand. Can you please try again?'

#Creating the chatbot
def chatbot_response(msg):
    ints = predict_class(msg, model)
    res = get_response(ints, intents)
    return res
  

#Running the chatbot
from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.static_folder = 'static'
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('message')
def handle_message(data):
    response = chatbot_response(data['message'])
    print(response)
    emit('recv_message', response)

if __name__ == "__main__":
    socketio.run(app, debug=True)