import sys
import json
import requests
import hashlib
from rx import Observable, Observer

AUTH_URL = "http://localhost:8888/auth"
USERS_URL = "http://localhost:8888/users"
BADSEC_HEADER = "Badsec-Authentication-Token"

def rx_get(url, headers):
	def subscribe(observer):
		response = requests.get(url, headers=headers)
		
		try:
			response.raise_for_status()
			observer.on_next(response)
			observer.on_completed()
		
		except requests.exceptions.RequestException as e:
			observer.on_error(e)
		
		return lambda: None
		
	return Observable.create(subscribe)
	
def print_response(response):
	users = response.text.splitlines()
	json.dump(users, sys.stdout)
	
def print_error(e):
	print("Error Occurred: ", e, file=sys.stderr)
	sys.exit(1)
	
def complete():
	sys.exit(0)

authResponse = requests.get(AUTH_URL)
token = authResponse.headers[BADSEC_HEADER]
chksumContent = token + "/users"
sha256 = hashlib.sha256();
sha256.update(str.encode(chksumContent))
chkSumHeaderContent = sha256.hexdigest()
headers = {"X-Request-Checksum": chkSumHeaderContent }

rx_get(USERS_URL, headers).retry(3).subscribe(on_next=print_response,
	on_error=print_error,
	on_completed=complete)
