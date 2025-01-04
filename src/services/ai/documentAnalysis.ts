import { HfInference } from '@huggingface/inference';

const hf = new HfInference('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');

export async function analyzeDocument(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await hf.documentQuestionAnswering({
      model: 'impira/layoutlm-document-qa',
      inputs: {
        question: "What is this document about?",
        image: file
      }
    });

    return response.answer || "Could not analyze the document.";
  } catch (error) {
    console.error('Document analysis failed:', error);
    return "Unable to analyze the document at this time.";
  }
}

export async function extractText(file: File): Promise<string> {
  try {
    const response = await hf.opticalCharacterRecognition({
      model: 'microsoft/trocr-base-handwritten',
      image: file
    });
    
    return response.text || "Could not extract text from the image.";
  } catch (error) {
    console.error('Text extraction failed:', error);
    return "Unable to extract text at this time.";
  }
}