document.addEventListener("DOMContentLoaded", function () {
  const WEBHOOK_URL =
    "https://discord.com/api/webhooks/1357729248131027098/9Ok-AGA4vGGzMFpQL_1tupVhBuSCNjZNMG1pK6oroUd3quWTeef3PSaX6J9XXK95lgev";
  const emojiMap = {
    Added: "🆕",
    Improved: "🛠",
    Fixed: "🔧",
    Changed: "🔄",
    Deprecated: "⚠️",
    Removed: "🗑️",
  };

  let catIndex = 1;
  let generatedJson = null;

  // Update counters function
  function updateCounters() {
    const catCount = document.querySelectorAll(".category-card").length;
    const entryCount = document.querySelectorAll(".entry-input").length;
    document.getElementById("categoryCount").textContent = `${catCount} ${
      catCount === 1 ? "category" : "categories"
    }`;
    document.getElementById("entryCount").textContent = `${entryCount} ${
      entryCount === 1 ? "entry" : "entries"
    }`;
  }

  // Create a new category
  function createCategory() {
    const catEl = document.createElement("div");
    catEl.className =
      "category-card bg-[#36393f] rounded-lg border border-[#2a2d31] flex flex-col overflow-hidden";
    catEl.innerHTML = `
      <div class="category-header bg-[#2a2d31] flex justify-between items-center px-4 py-3">
        <h3 class="font-semibold flex items-center text-gray-200 text-lg select-none">
          <i class="fas fa-folder mr-2 text-blue-400"></i>
          Category #${catIndex + 1}
        </h3>
        <button class="remove-cat text-red-500 hover:text-red-400 text-sm flex items-center">
          <i class="fas fa-trash mr-1"></i> Remove
        </button>
      </div>
      <div class="entries max-h-[300px] overflow-y-auto"></div>
      <div class="p-3">
        <button class="add-entry btn w-full bg-[#4f545c] hover:bg-[#5d6269] text-white rounded-md py-2 flex items-center justify-center transition-colors duration-200">
          <i class="fas fa-plus mr-2"></i> Add Entry
        </button>
      </div>
    `;

    // Add initial entry
    const entriesContainer = catEl.querySelector(".entries");
    entriesContainer.appendChild(createEntry());

    catIndex++;
    return catEl;
  }

  // Create a new entry
  function createEntry() {
    const entryEl = document.createElement("div");
    entryEl.className =
      "entry-row flex items-center border-b border-[#2a2d31] px-4 py-2 hover:bg-[#2f3136] transition-colors duration-200";
    entryEl.innerHTML = `
      <button class="remove-entry text-red-600 hover:bg-red-700 hover:text-white rounded-md w-8 h-8 flex items-center justify-center opacity-0 transition-opacity duration-200 mr-2" aria-label="Remove entry">
        <i class="fas fa-times"></i>
      </button>
      <input type="text" class="entry-input flex-grow bg-discord-input border border-[#2a2d31] rounded-md px-3 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Changelog detail...">
      <div class="drag-handle text-gray-400 cursor-move ml-3 w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200 select-none" aria-label="Drag handle">
        <i class="fas fa-grip-lines"></i>
      </div>
    `;
    return entryEl;
  }

  // Add category button
  document.getElementById("addCategory").addEventListener("click", function () {
    const container = document.getElementById("categoriesContainer");
    container.appendChild(createCategory());
    updateCounters();
  });

  // Event delegation for dynamic elements
  document.addEventListener("click", function (e) {
    // Remove category
    if (e.target.closest(".remove-cat")) {
      const card = e.target.closest(".category-card");
      card.style.opacity = "0";
      card.style.transform = "translateX(-20px)";
      setTimeout(() => {
        card.remove();
        updateCounters();
      }, 300);
    }

    // Add entry
    if (e.target.closest(".add-entry")) {
      const card = e.target.closest(".category-card");
      const entries = card.querySelector(".entries");
      entries.appendChild(createEntry());
      updateCounters();
    }

    // Remove entry
    if (e.target.closest(".remove-entry")) {
      const entry = e.target.closest(".entry-row");
      entry.style.opacity = "0";
      entry.style.transform = "translateX(-10px)";
      setTimeout(() => {
        entry.remove();
        updateCounters();
      }, 300);
    }
  });

  // Generate JSON
  document
    .getElementById("generateJson")
    .addEventListener("click", function () {
      const timestamp = new Date().toISOString();

      const categories = [];
      document.querySelectorAll(".category-card").forEach((card) => {
        // For simplicity, we'll use a fixed category type in this example
        const label = "Added";
        const entries = Array.from(card.querySelectorAll(".entry-input"))
          .map((input) => input.value.trim())
          .filter((text) => text !== "");
        categories.push({ label, entries });
      });

      const fields = categories.map((cat) => ({
        name: `${emojiMap[cat.label] || "📝"} ${cat.label}`,
        value: cat.entries
          .map(
            (e) =>
              `<:empty:1357591272327741460> <:subentry:1357591675580710942> ${e}`
          )
          .join("\n"),
        inline: false,
      }));

      generatedJson = {
        embeds: [
          {
            title: "📜 Changelog",
            description: "**Recent Updates:**",
            timestamp,
            color: 0xff8800,
            footer: { text: "Changelog Generator" },
            fields,
          },
        ],
        attachments: [],
        webhook_id: "",
        components: [],
      };

      const jsonString = JSON.stringify(generatedJson, null, 2);
      document.getElementById("outputJson").value = jsonString;
      document.getElementById("jsonPlaceholder").style.display = "none";
      document.getElementById("copyJson").disabled = false;
      document.getElementById("copyJson").classList.remove("opacity-50");
      document.getElementById("sendJson").disabled = false;
      document.getElementById("sendJson").classList.remove("opacity-50");
    });

  // Copy JSON to clipboard
  document.getElementById("copyJson").addEventListener("click", function () {
    const jsonText = document.getElementById("outputJson").value;
    if (jsonText) {
      navigator.clipboard.writeText(jsonText);
      const originalHTML = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        this.innerHTML = originalHTML;
      }, 2000);
    }
  });

  // Send JSON to Discord
  document
    .getElementById("sendJson")
    .addEventListener("click", async function () {
      if (!generatedJson) return;

      const btn = this;
      const originalText = btn.innerHTML;

      // Show loading state
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
      btn.disabled = true;

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(generatedJson),
        });

        if (response.ok) {
          btn.innerHTML = '<i class="fas fa-check mr-2"></i> Sent!';
          btn.classList.add("bg-green-600");
        } else {
          throw new Error(`Failed to send: ${response.status}`);
        }
      } catch (error) {
        console.error("Error sending to Discord:", error);
        btn.innerHTML = '<i class="fas fa-times mr-2"></i> Failed';
        btn.classList.add("bg-red-600");
      }

      // Reset button after 3 seconds
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove("bg-green-600", "bg-red-600");
      }, 3000);
    });
});
