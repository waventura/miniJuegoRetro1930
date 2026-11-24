package com.waventura.aventuraretro1930;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            PackageInfo pInfo = getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0);
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.0.0");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                ret.put("versionCode", pInfo.getLongVersionCode());
            } else {
                ret.put("versionCode", pInfo.versionCode);
            }
        } catch (Exception e) {
            ret.put("versionName", "1.0.0");
            ret.put("versionCode", 1);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        final String apkUrl = call.getString("url");
        final String version = call.getString("version", "latest");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("URL de APK inválida");
            return;
        }

        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                URL url = new URL(apkUrl);
                conn = (HttpURLConnection) url.openConnection();
                conn.setInstanceFollowRedirects(true);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(30000);
                conn.connect();

                if (conn.getResponseCode() >= 400) {
                    call.reject("Error HTTP " + conn.getResponseCode());
                    return;
                }

                int totalLen = conn.getContentLength();
                File dir = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (dir != null && !dir.exists()) {
                    dir.mkdirs();
                }
                File outFile = new File(dir, "AventuraRetro1930-" + version + ".apk");

                try (InputStream in = conn.getInputStream();
                     FileOutputStream out = new FileOutputStream(outFile)) {
                    byte[] buf = new byte[8192];
                    long downloaded = 0;
                    int read;
                    int lastPct = -1;
                    while ((read = in.read(buf)) != -1) {
                        out.write(buf, 0, read);
                        downloaded += read;
                        if (totalLen > 0) {
                            int pct = (int) ((downloaded * 100L) / totalLen);
                            if (pct != lastPct) {
                                lastPct = pct;
                                JSObject prog = new JSObject();
                                prog.put("percent", pct);
                                notifyListeners("downloadProgress", prog);
                            }
                        }
                    }
                    out.flush();
                }

                JSObject doneProg = new JSObject();
                doneProg.put("percent", 100);
                notifyListeners("downloadProgress", doneProg);

                Uri apkUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    outFile
                );
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
            } catch (Exception e) {
                call.reject("Error al descargar APK: " + e.getMessage());
            } finally {
                if (conn != null) conn.disconnect();
            }
        }).start();
    }
}
