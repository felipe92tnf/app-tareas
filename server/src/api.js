const API_URL = "http://localhost:3000/api/v1/tasks";

export async function getTasks() {
  const response = await fetch(API_URL);
  return await response.json();
}

export async function createTask(text) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  return await response.json();
}

export async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}