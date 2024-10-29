import requests
from bs4 import BeautifulSoup


def scrape_keywords(url):
    try:

        response = requests.get(url)
        

        if response.status_code == 200:
        
            soup = BeautifulSoup(response.text, 'html.parser')
   
            keywords_tag = soup.find('meta', attrs={'name': 'keywords'})
            
    
            if keywords_tag and 'content' in keywords_tag.attrs:
                print(f"Keywords found: {keywords_tag['content']}")
            else:
                print("No meta keywords tag found on this page.")
        else:
            print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
    
    except Exception as e:
        print(f"An error occurred: {e}")


url = input("Enter the URL of the website: ")


scrape_keywords(url)
