import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('tefApp', {
  platform: process.platform,
});
