import config from '../config/config.js'


async function callPaydock(url, data, httpMethod) {
  const apiUrl = await config.getPaydockApiUrl() + url
  const paydockCredentials = await config.getPaydockConfig('connection')
  const requestOptions = {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/json',
      'x-user-secret-key': paydockCredentials.credentials_secret_key
    }
  };
  if (httpMethod !== 'GET' && data) {
     requestOptions.body = JSON.stringify(data); // Ensure the body is stringified for POST requests
  }


  try {
    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData?.resource?.data ?? {};
  } catch (error) {
    console.error("Error fetching data: ", error);
    return {};
  }
}

export default {
  callPaydock
}
