import sys
import whisper

def main():
    audio_path = sys.argv[1]

    model = whisper.load_model("base")
    result = model.transcribe(audio_path)

    # IMPORTANT: only print text
    print(result["text"].strip())

if __name__ == "__main__":
    main()
