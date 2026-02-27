function sendMessage() {
  const input = document.getElementById("chat-input");
  const log = document.getElementById("chat-log");
  const userMessage = input.value.trim();
  log.innerHTML += "<p><b>You:</b> " + userMessage + "</p>";

  let reply = "Sorry, I don’t understand that.";

  // Greetings
  if (userMessage.toLowerCase().includes("hi") || userMessage.toLowerCase().includes("hello")) {
    reply = "Hello friend, welcome to Magamba High School website!";
  }
  // Fees
  else if (userMessage.toLowerCase().includes("fees")) {
    reply = "School fees are payable at the beginning of each term.";
  }
  // Results
  else if (userMessage.toLowerCase().includes("results")) {
    reply = "You can view results in the Results page of this website.";
  }
  // Contact
  else if (userMessage.toLowerCase().includes("contact")) {
    reply = "You can reach us via the Contact page or visit the school office.";
  }
  // Magamba environment
  else if (userMessage.toLowerCase().includes("magamba") || userMessage.toLowerCase().includes("lushoto")) {
    reply = "Magamba in Lushoto is part of the Usambara Mountains. It has a temperate climate (~20°C, ~1377 mm rainfall yearly), lush montane forests, waterfalls, caves, and viewpoints. Activities include hiking, camping, bird watching, photography, and eco-tourism projects like reforestation.";
  }

  log.innerHTML += "<p><b>Bot:</b> " + reply + "</p>";
  input.value = "";
}