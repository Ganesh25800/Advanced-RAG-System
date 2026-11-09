const conversation = document.getElementById("conversation");
const welcome = document.getElementById("welcome");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const plusButton = document.getElementById("plus-button");
const uploadMenu = document.getElementById("upload-menu");
const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");
const attachment = document.getElementById("attachment");

function addMessage(role, text) {
  welcome?.remove();
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  const label = document.createElement("span");
  label.className = "label";
  label.textContent = role === "user" ? "You" : "RAG";
  const content = document.createElement("span");
  content.textContent = text;
  bubble.append(label, content);
  conversation.appendChild(bubble);
  conversation.scrollTop = conversation.scrollHeight;
}

async function parseResponse(response) {
  let data;
  try { data = await response.json(); } catch { throw new Error("Server returned an invalid response."); }
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Request failed.");
  return data;
}

plusButton.addEventListener("click", () => {
  uploadMenu.hidden = !uploadMenu.hidden;
  plusButton.setAttribute("aria-expanded", String(!uploadMenu.hidden));
});
uploadButton.addEventListener("click", () => {
  uploadMenu.hidden = true;
  plusButton.setAttribute("aria-expanded", "false");
  fileInput.click();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".upload-wrap")) {
    uploadMenu.hidden = true;
    plusButton.setAttribute("aria-expanded", "false");
  }
});
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".pdf") || file.size > 20 * 1024 * 1024) {
    addMessage("assistant", "Please select a PDF no larger than 20 MB.");
    fileInput.value = "";
    return;
  }
  attachment.hidden = false;
  attachment.textContent = `Uploading ${file.name}...`;
  const data = new FormData();
  data.append("file", file);
  try {
    const result = await parseResponse(await fetch("/api/upload", { method: "POST", body: data }));
    attachment.textContent = `✓ ${result.filename}`;
    addMessage("assistant", `Uploaded ${result.filename} successfully. Indexing is not enabled yet.`);
  } catch (error) {
    attachment.hidden = true;
    addMessage("assistant", `Upload failed: ${error.message}`);
  } finally { fileInput.value = ""; }
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || sendButton.disabled) return;
  addMessage("user", message);
  input.value = "";
  input.style.height = "auto";
  sendButton.disabled = true;
  try {
    const result = await parseResponse(await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    }));
    addMessage("assistant", result.message);
  } catch (error) {
    addMessage("assistant", `Request failed: ${error.message}`);
  } finally { sendButton.disabled = false; input.focus(); }
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    form.requestSubmit();
  }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});
