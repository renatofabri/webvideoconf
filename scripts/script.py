import os
import openai


def is_not_audio_file(audio_snippet):
    return audio_snippet[-2:] != 'ts'

if __name__ == "__main__":
    audio_samples = os.listdir("audio_samples")
    for audio_snippet in audio_samples:
        if audio_snippet[-2:] != 'ts':
            continue
        audio_snippet_exploded = audio_snippet[:-3].split("_")
        timestamp = audio_snippet_exploded[-1]
        uid = audio_snippet_exploded[-6]
        new_name = "{timestamp}-{uid}-{name}".format(timestamp=timestamp, uid=uid, name=audio_snippet)
        # os.rename("audio_samples/{}".format(audio_snippet), "audio_samples/{}".format(new_name))

    print(os.getenv("OPENAI_ACCESS_KEY"))
