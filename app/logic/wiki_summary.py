import wikipedia

def get_wikipedia_data(topic: str):
    try:
        page = wikipedia.page(topic, auto_suggest=False)
        summary = page.summary[:1000]  # limit to first 1000 chars
        links = page.links[:10]        # limit to top 10 related topics
        return summary, links
    except Exception as e:
        return "No Wikipedia summary found.", []