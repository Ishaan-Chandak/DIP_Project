from flask import Flask, request, jsonify
import numpy as np
import os
from keras.models import load_model
import cv2
import imutils

app = Flask(__name__)
# Load the Keras model
model = load_model(os.path.join('', 'cnn-parameters-improvement-02-0.85.keras'))

def crop_brain_contour(image, plot=False):
    # Convert the image to grayscale, and blur it slightly
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    # Threshold the image, then perform a series of erosions +
    # dilations to remove any small regions of noise
    thresh = cv2.threshold(gray, 45, 255, cv2.THRESH_BINARY)[1]
    thresh = cv2.erode(thresh, None, iterations=2)
    thresh = cv2.dilate(thresh, None, iterations=2)

    # Find contours in thresholded image, then grab the largest one
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    c = max(cnts, key=cv2.contourArea)

    # Find the extreme points
    extLeft = tuple(c[c[:, :, 0].argmin()][0])
    extRight = tuple(c[c[:, :, 0].argmax()][0])
    extTop = tuple(c[c[:, :, 1].argmin()][0])
    extBot = tuple(c[c[:, :, 1].argmax()][0])
    
    # crop new image out of the original image using the four extreme points (left, right, top, bottom)
    new_image = image[extTop[1]:extBot[1], extLeft[0]:extRight[0]]  
    
    return new_image

def preprocess_image(image, image_size):
    """
    Preprocess a single image.
    Arguments:
        image: A numpy array representing the input image.
        image_size: A tuple representing the desired image size (width, height).
    Returns:
        processed_image: A numpy array representing the preprocessed image.
    """
    processed_image = crop_brain_contour(image, plot=False)
    processed_image = cv2.resize(processed_image, dsize=image_size, interpolation=cv2.INTER_CUBIC)
    # Normalize values
    processed_image = processed_image / 255.
    # Add an additional dimension to match the model's input shape
    processed_image = np.expand_dims(processed_image, axis=0)
    
    return processed_image


def predict(input_data):
    prediction = model.predict(input_data)
    return prediction

@app.route('/predict', methods=['POST'])
def get_prediction():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    file.save("image.jpg")
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    input_image = cv2.imread("image.jpg")
    processed_image = preprocess_image(input_image, (240, 240))

    prediction_array = predict(processed_image)
    print(prediction_array)
    prediction_value = prediction_array[0][0]  # Assuming the prediction array structure
    prediction = round(prediction_value, 3)
    prediction = str(prediction)
    return jsonify({'prediction': prediction})


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)