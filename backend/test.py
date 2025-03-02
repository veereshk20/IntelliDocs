def remove_first_last_line(text):
    lines = text.splitlines()  # Split into lines
    if len(lines) > 2:  # Ensure there are at least three lines to remove first & last
        return "\n".join(lines[1:-1])  # Join everything except the first and last line
    return ""  # Return empty string if there aren't enough lines

# Example usage:
string = """```json
{
  "MetaData": {
    "FileName": "amitpatientdetails.pdf",
    "FileType": "pdf"
  },
  "summary": "This document is a patient information form for Amit Verma. It includes personal details such as name, date of birth, contact information, and address. It also contains emergency contact details and insurance information. The form is signed by Amit Verma, certifying the accuracy of the provided information.",
  "sentiment": "neutral",
  "class": "document",
  "tags": [
    "patient information",
    "personal details",
    "insurance information",
    "emergency contact",
    "medical form"
  ],
  "datatype": "Text",
  "importance": 4,
  "Medical data": {
    "PatientName": "Amit Verma",
    "Patient Identification": {
      "Patient Information": {
        "First Name": "Amit",
        "Last Name": "Verma",
        "Date of Birth": "15/08/1978",
        "Gender": "Male",
        "Blood Group": "O+",
        "Marital Status": "Married",
        "Occupation": "Software Engineer",
        "Nationality": "Indian"
      },
      "Address": {
        "Address": "123, Gandhi\nConnaught Place,\nNew Delhi, Delhi, 110001"
      },
      "Contact Information": {
        "Phone": "+91-9876543210",
        "Email": "amit.verma@example.com",
        "Preferred Contact Method": [
          "Phone",
          "Email"
        ]
      },
      "Emergency Contact": {
        "Name": "Ramesh Verma",
        "Relationship": "Father",
        "Phone": "+91-9123456780",
        "Address": "Marg,"
      },
      "Insurance Information": {
        "Insurance Company": "Apollo Health Insurance",
        "Policy Number": "APOL123456789",
        "Group Number": "GRP98765",
        "Policy Validity": "01/01/2023\n31/12/2023"
      }
    }
  }
}
```"""

cleaned_string = remove_first_last_line(string)
print(cleaned_string)
