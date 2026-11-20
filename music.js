(() => {
  const track = document.getElementById("music-track");
  const button = document.getElementById("sound");
  const key = "class6a.audio.enabled";

  try { sound = localStorage.getItem(key) !== "off"; } catch {}
  track.volume = 0.30;

  function updateButton() {
    button.textContent = sound ? "♫ 開" : "♫ 關";
    button.setAttribute("aria-pressed", String(sound));
    button.title = sound ? "關閉音樂與音效" : "開啟音樂與音效";
  }
  function play() {
    if (sound && track.paused) track.play().catch(() => {});
  }
  button.addEventListener("click", () => {
    sound = !sound;
    try { localStorage.setItem(key, sound ? "on" : "off"); } catch {}
    if (sound) { play(); tone(); }
    else track.pause();
    updateButton();
  });
  // Touch, mouse and keyboard activation support browsers that defer autoplay.
  document.addEventListener("click", event => {
    if (!button.contains(event.target)) play();
  });
  document.addEventListener("keydown", event => {
    if (event.target !== button && event.key !== "Escape") play();
  });
  updateButton();
  play();
})();
