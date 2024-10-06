import sqlite3
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# Load the GPT-J model and tokenizer
model_name = "EleutherAI/gpt-neo-1.3B"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# If you have a GPU, move the model to GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Database setup
conn = sqlite3.connect('conversation_history.db')
cursor = conn.cursor()
cursor.execute('''CREATE TABLE IF NOT EXISTS conversations (
    user_id TEXT,
    conversation_summary TEXT,
    key_insights TEXT
)''')
conn.commit()

# Function to generate AI response with conversation history
def generate_response_with_history(user_id, prompt):
    # Retrieve conversation history for the user
    cursor.execute("SELECT conversation_summary, key_insights FROM conversations WHERE user_id=?", (user_id,))
    history = cursor.fetchone()
    
    if history:
        conversation_summary, key_insights = history
        prompt = f"Previous conversation summary: {conversation_summary}. Key insights: {key_insights}. New prompt: {prompt}"
    
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    outputs = model.generate(inputs.input_ids, max_length=200, do_sample=True)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Save the conversation summary and key insights
    conversation_summary = f"User {user_id} discussed {prompt} and received response: {response}"
    key_insights = "Key insights from the conversation..."  # You can extract insights from the response here
    cursor.execute("INSERT INTO conversations (user_id, conversation_summary, key_insights) VALUES (?, ?, ?)", (user_id, conversation_summary, key_insights))
    conn.commit()
    
    return response

# Define a route for AI interaction with conversation history
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_id = data.get("user_id", "anonymous")
    prompt = data.get("prompt", "")
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    ai_response = generate_response_with_history(user_id, prompt)
    return jsonify({"response": ai_response})

# Function to generate AI response
def generate_response(prompt):
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    outputs = model.generate(inputs.input_ids, max_length=200, do_sample=True)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response

# Define a route for AI interaction
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    # Generate AI response
    ai_response = generate_response(prompt)
    return jsonify({"response": ai_response})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
