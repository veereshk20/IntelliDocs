import os
import json
import re
import numpy as np
import docx2txt  # For DOCX text extraction
import easyocr
from pdf2image import convert_from_path
import datetime
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

load_dotenv()

# IMPORTANT: We'll use google.generativeai for the image-extraction portion
import google.generativeai as genai

###############################################################################
# CONFIGURE GEMINI
###############################################################################
# Replace this with your actual API key
API_KEY = os.getenv('API_KEY')                     #!  POINT ONE
genai.configure(api_key='AIzaSyDmGsZVGp5bzKuXLHxiCMD9-BzqmHYGwcA')

app = Flask(__name__)
CORS(app)

file_names_response = []  # Global list to store response file paths
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Allowed extensions (no leading dot for "docx")
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "docx"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

###############################################################################
# GEMINI Image Extraction Helper
###############################################################################
def gemini_extract_image_text(image_path):
    """
    Upload an image to Gemini and extract text from it (verbatim).
    Returns the text that Gemini recognized from the image.
    """
    # 1) Upload the file
    uploaded_file = genai.upload_file(path=image_path, display_name="UploadedImage")
    
    # 2) Choose a Gemini model
    model = genai.GenerativeModel(model_name="gemini-2.0-flash")
    
    # 3) Construct a direct prompt for extracting text verbatim
    prompt = (
        "You are a powerful OCR system that extracts text from images. "
        "Below is an image with handwritten or typed text. "
        "Please return the text EXACTLY as it appears in the image, line by line, "
        "with no extra commentary."
    )
    
    # 4) Call generate_content, passing both the file reference and the prompt
    response = model.generate_content([uploaded_file, prompt])
    extracted_text = response.text.strip()
    return extracted_text

###############################################################################
# MAIN UPLOAD ROUTE
###############################################################################
@app.route('/process', methods=['POST'])
def process_file():
   # print("file responses ",file_names_response)
    ##print("Request json == ",request.json)
    data = request.json
    if(data['ext']=='docx'):
        response_doc=process_with_gemini(data['Docx']['content']['ops'][0]['insert'])
        response_doc = remove_first_last_line(response_doc)
        #print("Requesr_json",request.json)
        doc_id=data['Docx']['Document_id']
        
        
        response_filename = f"{doc_id}_response.json"
        response_path = os.path.join(app.config['UPLOAD_FOLDER'],response_filename)
        
        file_names_response.append(response_path)
        
        # print("Response : ",response_doc)
        
        with open(response_path,'w' , encoding='utf-8') as f:
            f.write(response_doc)
        return jsonify({
            "message": "Uploaded!",
            "docs":  response_doc 
        }), 200
        #process_with_gemini(data['Docx']['content'])
    print("Data == ",data)
    if not data:
        return jsonify({"error : No documents provided"}),400
    File_id = data['File_id'] 
    url = data['url']['secure_url']
    response_data = []
    
    # print(File_id)
    # print(url)
    # for doc in documents:
    if url == "" or File_id == "":
        response_data.append(
            {
                "error": "Invalid document format",
                "received_data" : ""
            }
        )
        # continue
        
    # url = doc['url']
    # doc_id = doc['doc_id']

    try:
        print("In Try")
        response = requests.get(url)
        response.raise_for_status()
        
        print("Response : ",response)
        
        filename = secure_filename(url.split('/')[-1].split('?')[0])
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'],filename)
        
        with open(temp_path,'wb') as f:
            f.write(response.content)
        
        extracted_text = perform_ocr(temp_path,filename)
        gemini_response = process_with_gemini(extracted_text)
        gemini_response = remove_first_last_line(gemini_response)
        response_filename = f"{File_id}_response.json"
        response_path = os.path.join(app.config['UPLOAD_FOLDER'],response_filename)
        
        file_names_response.append(response_path)
        
        print("Response : ",gemini_response)
        
        with open(response_path,'w' , encoding='utf-8') as f:
            f.write(gemini_response)
            
        response_data.append({
            "File_id" : File_id,
            "status" : "Processed",
            "response_file" : response_filename,
            "file_metadata" : {
                "original_filename": filename,
                "Processed_at" : datetime.datetime.now().isoformat()
            },
            "response_data_json_content" : gemini_response
        })
        
        
        
        os.remove(temp_path)
        
    except Exception as e:
        print("In exception ,",e)
        response_data.append({
            "File_id" : File_id,
            "status" : "error",
            "error" : str(e),
            "url" : url
        })

    
    return jsonify({
        "message": "Files uploaded and processed successfully!",
        "files": response_data
    }), 200

###############################################################################
# PERFORM OCR / TEXT EXTRACTION (PDF → EasyOCR, DOCX → docx2txt, IMAGES → Gemini)
###############################################################################
def perform_ocr(filepath, filename):
    extracted_text = ""
    file_extension = filename.rsplit('.', 1)[1].lower()

    # 1) PDF
    if file_extension == 'pdf':
        try:
            # Convert PDF to images
            POPPLER_PATH = r'/usr/bin'            #! POINT TWO
            images = convert_from_path(filepath, poppler_path=POPPLER_PATH)
        except Exception as e:
            print("Error converting PDF to images:", e)
            raise e

        # Use EasyOCR on each PDF page (image)
        reader = easyocr.Reader(['en'], gpu=True)                           #! POINT THREE
        for image in images:
            img_np = np.array(image)
            result = reader.readtext(img_np, detail=0)
            extracted_text += "\n".join(result) + "\n"

    # 2) DOCX
    elif file_extension == 'docx':
        extracted_text = docx2txt.process(filepath)
        

    # 3) IMAGES (PNG, JPG, JPEG) → Use Gemini for text extraction
    else:
        extracted_text = gemini_extract_image_text(filepath)

    # Add metadata at the top
    metadata = f"MetaData : {{\nFileName: {filename}\nFileType: {file_extension}\n}}\n\n"
    final_text = metadata + extracted_text

    # # Save the final text (with metadata) to a .txt file
    # base_name = os.path.splitext(filename)[0]
    # txt_filename = base_name + ".txt"
    # txt_filepath = os.path.join(os.path.dirname(filepath), txt_filename)
    # try:  
    #     with open(txt_filepath, 'w', encoding='utf-8') as f:
    #         f.write(final_text)
    #     print(f"OCR text with metadata saved to: {txt_filepath}")
    # except Exception as e:
    #     print("Error saving text file:", e)

    return final_text

###############################################################################
# PROCESS WITH GEMINI (DOCUMENT ANALYSIS)
###############################################################################
def process_with_gemini(extracted_text):
    prompt = f"""You are a document analysis assistant. Analyze the provided text and perform the following tasks:
    Analyse this text: "{extracted_text}"
    I need output in this format:
    1. MetaData : Keep whats there in file as it is don't change anything.
    2. Summary: Generate a concise summary of the given text , keep it as small as possible and dont exceed more than 5 lines.
    3. Sentiment: Determine the overall sentiment of the given text (positive, negative, neutral).
    4. Class: Classify the given text strictly as one of the following: invoices, contracts, resume, document.
    5. Tags: Extract relevant keywords (tags) that capture the main topics of the document order them in most important to least , only give top five tags.
    6. DataType : Numerical/Text/both  Give kind of data present in the document.
    7. Importance : Rate the importance of a given file on a scale of 0 to 5, where 0 is least important and 5 requires urgent attention. Assign ratings based on the document's significance in its field. For example, medical files with abnormalities should be rated 5, unpaid bills near their deadline should be rated 4 (adjusted based on time left), and serious legal issues should receive high priority. Apply this logic across all domains—prioritizing documents containing critical or time-sensitive information.
    ---------------------------
    If the given file has Medical data then only keep this section else skip this complete below section
    Medical data:
    Paitent Name:[
        Patient Identification: [This should contain full Patient information,Insurance Details,his/her Address and demographics]

        Clinical Data : [This section should contain primary diagnosis information, if any abnormals are present in the report just indicate show them here , for example RBC: count is very less ,Also mention and important sympotms found in the report if mentioned]

        Billing : [Analize the bills of the patient, Take important Dates and Times,Total amount to be paid,and important imformation from bills]
    ]
    the above three are not must , if a file has patient information you can skip clinical data and Billing sections and only keep Patient Identification, if the file only contains Billing then only keep  Billing information and you can skip Patient Identification and Clinical Data fileds.

    NOTE : KEEP THE PATIENT NAME AS IT IS BECAUSE IT WILL BE HELPING US IN MAPPING DIFFERENT FILES OF SAME PATIENT,FOR NOW PATIENT NAME IS UNIQUE AND NO DUBLICATES WILL BE THERE,ALSO DONT ADD ANY NEW DATA JUST PRESENT THE MEDICAL DATA AS IT IS GIVEN IN FILE, NO SUGGESTIONS OR PREDICTIONS,BECAUSE THIS IS A VERY SENSITIVE APPLICATION.
    ---------------------------

    Output your result strictly in the following format only give in json format,ONLY JSON FORMAT STRICTLY:

    "MetaData":[Same as given in extracted file no changes]
    "summary": [Your 4-5 line summary]
    "sentiment": [Your sentiment]
    "class": [Your classification]
    "tags": [Your tags]
    "datatype": [Numerical/Text/both Numerical and Text]
    "importance": [rating on a scale of 0 to 5]

    ---------------------------------
    (THE BELOW SECTION ONLY APPLICABLE FOR MEDICAL FILES FOR OTHER FILES SKIP THIS SECTION)
    "Medical data"[:
    "PatientName":[
        "Patient Identification": (if applicable)
        "Clinical Data" : (if applicable)
        "Billing" : (if applicable)
    ]]
    ----------------------------------
    """

    # Use Gemini to process the extracted text
    model = genai.GenerativeModel(model_name="gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text

###############################################################################
# UTILITY FUNCTIONS (extract_summary_tags, extract_fields, generate_llm_input)
###############################################################################
def extract_summary_tags(file_path):
    """Extracts the first sentence of the summary and the tags from a response file."""
    summary = ""
    tags = ""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines:
                if line.startswith("summary:"):
                    summary = line.replace("summary:", "").strip()
                    # Take only first sentence
                    summary = summary.split(".")[0] + "."
                elif line.startswith("tags:"):
                    tags = line.replace("tags:", "").strip()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
    return summary, tags

def extract_fields(file_path):
    """
    Extracts fields from the given file's content.
    Supports both plain text responses and JSON formatted files.
    Returns a dictionary with keys:
    MetaData, summary, sentiment, class, tags, datatype, importance, Medical data.
    """
    fields = {
        "MetaData": "",
        "summary": "",
        "sentiment": "",
        "class": "",
        "tags": "",
        "datatype": "",
        "importance": "",
        "Medical data": ""
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Attempt JSON parsing if the content appears to be JSON formatted
        content_strip = content.strip()
        if content_strip.startswith("{") and content_strip.endswith("}"):
            try:
                data = json.loads(content_strip)
                fields["MetaData"] = json.dumps(data.get("MetaData", {}), indent=2)
                fields["summary"] = data.get("summary", "")
                fields["sentiment"] = data.get("sentiment", "")
                fields["class"] = data.get("class", "")
                tags_val = data.get("tags", "")
                if isinstance(tags_val, list):
                    fields["tags"] = ", ".join(tags_val)
                else:
                    fields["tags"] = tags_val
                fields["datatype"] = data.get("datatype", "")
                fields["importance"] = str(data.get("importance", ""))
                if "Medical data" in data:
                    fields["Medical data"] = json.dumps(data.get("Medical data", {}), indent=2)
                return fields
            except Exception as e:
                print(f"JSON parsing failed for {file_path}: {e}")
        
        # Regex-based extraction for plain text files
        meta_pattern = re.compile(r"MetaData\s*[:]*\s*(\{[\s\S]+?\})", re.IGNORECASE)
        summary_pattern = re.compile(r"summary\s*:\s*([\s\S]+?)(?=\n(?:sentiment:|class:|tags:|datatype:|importance:|Medical data:|$))", re.IGNORECASE)
        sentiment_pattern = re.compile(r"sentiment\s*:\s*(.+)", re.IGNORECASE)
        class_pattern = re.compile(r"class\s*:\s*(.+)", re.IGNORECASE)
        tags_pattern = re.compile(r"tags\s*:\s*(.+)", re.IGNORECASE)
        datatype_pattern = re.compile(r"datatype\s*:\s*(.+)", re.IGNORECASE)
        importance_pattern = re.compile(r"importance\s*:\s*(.+)", re.IGNORECASE)
        medical_pattern = re.compile(r"Medical data\s*:\s*([\s\S]+?)(?=\n[-]+|$)", re.IGNORECASE)
        
        meta_match = meta_pattern.search(content)
        if meta_match:
            fields["MetaData"] = meta_match.group(1).strip()
        
        summary_match = summary_pattern.search(content)
        if summary_match:
            fields["summary"] = summary_match.group(1).strip()
        
        sentiment_match = sentiment_pattern.search(content)
        if sentiment_match:
            fields["sentiment"] = sentiment_match.group(1).strip()
        
        class_match = class_pattern.search(content)
        if class_match:
            fields["class"] = class_match.group(1).strip()
        
        tags_match = tags_pattern.search(content)
        if tags_match:
            fields["tags"] = tags_match.group(1).strip()
        
        datatype_match = datatype_pattern.search(content)
        if datatype_match:
            fields["datatype"] = datatype_match.group(1).strip()
        
        importance_match = importance_pattern.search(content)
        if importance_match:
            fields["importance"] = importance_match.group(1).strip()
        
        medical_match = medical_pattern.search(content)
        if medical_match:
            fields["Medical data"] = medical_match.group(1).strip()
    
    except Exception as e:
        print(f"Error extracting fields from {file_path}: {e}")
    
    return fields

def generate_llm_input(file_names_response):
    """
    Generates the formatted input string for the LLM API by extracting and formatting
    all required fields from each response file.
    """
    llm_input = ""
    for file_path in file_names_response:
        filename = os.path.basename(file_path)
        fields = extract_fields(file_path)
        llm_input += f"{filename}:\n"
        llm_input += f"MetaData: {fields.get('MetaData', '')}\n"
        llm_input += f"summary: {fields.get('summary', '')}\n"
        llm_input += f"class: {fields.get('class', '')}\n"
        llm_input += f"tags: {fields.get('tags', '')}\n"
        llm_input += f"importance: {fields.get('importance', '')}\n"
        if fields.get("Medical data", ""):
            llm_input += f"Medical data: {fields.get('Medical data', '')}\n"
        llm_input += "\n"
    return llm_input

def remove_first_last_line(text):
    lines = text.splitlines()  # Split into lines
    if len(lines) > 2:  # Ensure there are at least three lines to remove first & last
        return "\n".join(lines[1:-1])  # Join everything except the first and last line
    return ""  # Return empty string if there aren't enough lines
###############################################################################
# GROUP ENDPOINT
###############################################################################
@app.route('/group', methods=['GET'])
def group_files():
    print("file_names_response:", file_names_response)
    llm_input_string = generate_llm_input(file_names_response)
    final_prompt = f"""{llm_input_string}
This is the details of the files.
The format is of form:

MetaData:(Which contain FileName,FileType) [EXTRACT FileName from here this is the original file name]
summary:
class:
tags:
importance:
Medical data: (very very important)
---------
SO MetaData is the starting point of any file

Now your task is to group the files according to their tags. Create groups with meaningful group names based on the tags.
For example, if some files are related to medical topics, group them under 'medical'; if some are legal documents, group them under 'legal';
if some are bills, group them under 'bills'. Also if we dive deep into Medical data, our dataset is scattered, a patient can have any number of files; for example, a person named amit can have patientdetails file, clinicaldata file, bills related to him. You should identify the files belonging to a person by the Name of the patient provided in each file, so in our case all files contain name amit. Sometimes if the name is neha sharma, but files have first name Neha and second name shema, it's still considered files of the same person. We can have scattered files belonging to many different people; we should group like:

Amit Verma : {{amitbilldata.pdf,amitclinicaldata.pdf,amitpatientdetails.pdf}}
STRICTLY NOT amitbilldata_response.txt DONT INCLUDE THESE FILES , INSIDE THEM THERE IS META DATA IN WHICH ORIGINAL NAME IS THERE USE THAT FILE NAME.
Also file names in the group should be taken from metadata section which has file name in it, use the exact name from that not response file names.

Final output should look like:
Groups :
"medical" : {{file1, file2, file3}}
"legal" : {{file4, file5, file6}}
"bills" : {{file7, file8, file9}}
"patient name":{{all his files}}
----
After this our task is to provide summary of medical data of all patients
it should be of format:
"Medical Data":
[
    "patient1 name":[
        Patient Identification: [This should contain full Patient information,Insurance Details,his/her Address and demographics]
        Clinical Data : [This section should contain primary diagnosis information, if any abnormals are present in the report just indicate show them here, for example RBC: count is very less, Also mention any important symptoms found in the report if mentioned]
        Billing : [Analyze the bills of the patient, take important Dates and Times, Total amount to be paid, and important information from bills]
    ]
    
    "patient2 name":[
        Patient Identification: [This should contain full Patient information,Insurance Details,his/her Address and demographics]
        Clinical Data : [This section should contain primary diagnosis information, if any abnormals are present in the report just indicate show them here, for example RBC: count is very less, Also mention any important symptoms found in the report if mentioned]
        Billing : [Analyze the bills of the patient, take important Dates and Times, Total amount to be paid, and important information from bills]
    ]
]
NOTE: PATIENT NAME IS UNIQUE AND CAN BE USED IN MAPPING DIFFERENT FILES OF SAME PATIENT,FOR NOW PATIENT NAME IS UNIQUE AND NO DUBLICATES WILL BE THERE,ALSO DONT ADD ANY NEW DATA JUST PRESENT THE MEDICAL DATA AS IT IS GIVEN IN FILE, NO SUGGESTIONS OR PREDICTIONS,BECAUSE THIS IS A VERY SENSITIVE APPLICATION.
NOTE: GIVE PATIENT NAME TO GROUP AND in MEDICAL DATA SUMMARY SO THEY BOTH CAN BE EASYLY MAPPED.

Output should be strictly in the following json format ONLY JSON FORMAT STRICTLY:

"Groups":[
"group_name1" : [file names]]
"group_name2" : [[file names]]
"patient1 name": [[all his files]]
--------------------------------------
"Medical Data" : [
    "patient1 name":[
        "Patient Identification": [....]
        "Clinical Data" : [... ]
        "Billing" : [... ]
    ]
    ... and all peoples data
]
--------------------------------------
"""
    grouped_filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'grouped.txt')

    # We'll use the same gemini model call
    model = genai.GenerativeModel(model_name="gemini-2.0-flash")
    grouped_text_response = model.generate_content(final_prompt)
    grouped_text = grouped_text_response.text
    grouped_text = remove_first_last_line(grouped_text)
    
    return grouped_text

    # with open(grouped_filepath, 'w', encoding='utf-8') as f:
    #     f.write(grouped_text)
        
    # print("grouped.txt created at:", grouped_filepath)
    # return jsonify({"message": "Grouped prompt generated successfully!", "grouped_prompt": grouped_text}), 200

###############################################################################
# RUN
###############################################################################
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)



