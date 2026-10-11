// api.js – Centralized API helper for AgroConnect
// All backend communication goes through this module

const BASE_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  return headers;
}


async function handleResponse(response) {


    if (response.status === 204) {
        return null;
    }


    const text = await response.text();

   
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
       
            data = null;
        }
    }

    
    if (!response.ok) {

        const errorMessage =
            data?.message ||
            data?.error ||
            text ||
            `Request failed with status ${response.status}`;

        throw new Error(errorMessage);
    }

    return data;
}

// ---------- Public functions ----------

export async function apiGet(endpoint) {
  const response = await fetch(BASE_URL + endpoint, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
}


export async function apiPost(endpoint, body) {

    const options = {

        method: "POST"

    };

    if (body instanceof FormData) {

        const token = getToken();

        options.body = body;

        if (token) {

            options.headers = {

                Authorization: "Bearer " + token

            };

        }

    }

    else {

        options.headers = getHeaders();

        options.body = JSON.stringify(body);

    }

    const response = await fetch(

        BASE_URL + endpoint,

        options

    );

    return handleResponse(response);

}

export async function apiPut(endpoint, body) {
  const response = await fetch(BASE_URL + endpoint, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function apiDelete(endpoint) {
  const response = await fetch(BASE_URL + endpoint, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}
