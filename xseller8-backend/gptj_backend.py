import os
import json
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Define the directory for conversation storage
CONVERSATION_DIR = 'F:/Datasets/PiggieSmalls'

# Load the GPT-J model and tokenizer
model_name = "Wonder-Griffin/judge-xl-model"  # Use GPT-Neo to reduce memory footprint
model = AutoModelForCausalLM.from_pretrained("Wonder-Griffin/judge-xl-model", trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained("Wonder-Griffin/judge-xl-model")

# If you have a GPU, move the model to GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Helper function to load conversation history from JSON
def load_conversation_history(user_id):
    filepath = os.path.join(CONVERSATION_DIR, f"{user_id}_conversation.json")
    if os.path.exists(filepath):
        with open(filepath, 'r') as file:
            return json.load(file)
    return {"conversation_summary": "", "key_insights": ""}

# Helper function to save conversation history to JSON
def save_conversation_history(user_id, conversation_summary, key_insights):
    filepath = os.path.join(CONVERSATION_DIR, f"{user_id}_conversation.json")
    with open(filepath, 'w') as file:
        json.dump({"conversation_summary": conversation_summary, "key_insights": key_insights}, file)

# Generate AI response and update conversation history
def generate_response_with_history(user_id, prompt):
    history = load_conversation_history(user_id)
    conversation_summary = history.get("conversation_summary", "")
    key_insights = history.get("key_insights", "")

    prompt_with_history = f"Previous conversation summary: {conversation_summary}. Key insights: {key_insights}. New prompt: {prompt}"
    
    # Generate AI response
    inputs = tokenizer(prompt_with_history, return_tensors="pt").to(device)
    outputs = model.generate(inputs.input_ids, max_length=200, do_sample=True)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Update conversation history
    conversation_summary = f"{conversation_summary} {prompt}. AI: {response}"
    key_insights = f"{key_insights} Insights from the new conversation..."  # Example logic for key insights
    
    # Save updated conversation history
    save_conversation_history(user_id, conversation_summary, key_insights)
    
    return response

# Define a route to get conversation history
@app.route('/session/history', methods=['GET'])
def get_conversation_history():
    user_id = request.args.get('user_id', 'anonymous')
    history = load_conversation_history(user_id)
    return jsonify(history)

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

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
