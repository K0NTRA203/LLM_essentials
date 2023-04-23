import os
# import ffmpeg
import subprocess    
from werkzeug.utils import secure_filename
import openai
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.environ['OPENAI_KEY']

def convert_oga_wav(oga_file_path, wav_file_path):
  # Generate the output file path
  # wav_file_path = os.path.splitext(oga_file_path)[0] + ".wav"
  # Execute the ffmpeg command to convert the file
  cmd = f"ffmpeg -i {oga_file_path} {wav_file_path}"
  try:
      subprocess.check_output(cmd.split(), stderr=subprocess.STDOUT)
  except subprocess.CalledProcessError as e:
      print(f"Error converting file: {e.output}")
      return None

  return wav_file_path

def transcribe(audio_file):
    filename = secure_filename(audio_file.filename)
    tmp_dir = '/tmp'
    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
    tmp_file = os.path.join(tmp_dir, filename)
    audio_file.save(tmp_file)
    convert_oga_wav(tmp_file, os.path.join(tmp_dir, 'x.wav'))
    audio_file = open(os.path.join(tmp_dir, 'x.wav'), "rb")
    transcription = openai.Audio.transcribe("whisper-1", audio_file, language='fa')['text']
    os.remove(tmp_file)
    os.remove(os.path.join(tmp_dir, 'x.wav'))
    return transcription
