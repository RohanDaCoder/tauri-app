import { contextBridge } from "@tauri-apps/api/tauri";

contextBridge.exposeInMainWorld("tauriAPI", {
  windowControl: async (action) => {
    // Use Tauri window API for window controls
    const { appWindow } = await import("@tauri-apps/api/window");
    switch (action) {
      case "minimize":
        appWindow.minimize();
        break;
      case "maximize":
        appWindow.toggleMaximize();
        break;
      case "close":
        appWindow.close();
        break;
    }
  },
});
