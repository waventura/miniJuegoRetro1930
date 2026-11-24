package com.waventura.aventuraretro1930;

import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;
import java.util.Set;

@CapacitorPlugin(name = "RetroTts")
public class RetroTtsPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private boolean ready = false;

    @Override
    public void load() {
        tts = new TextToSpeech(getContext(), this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            ready = true;
            selectNaturalLatinVoice();
        }
    }

    private void selectNaturalLatinVoice() {
        if (tts == null) return;
        Locale[] preferred = new Locale[] {
            new Locale("es", "MX"),
            new Locale("es", "US"),
            new Locale("es", "419"),
            new Locale("es", "CO"),
            new Locale("es", "AR"),
            new Locale("es", "ES")
        };

        try {
            Set<Voice> voices = tts.getVoices();
            if (voices != null) {
                for (Locale loc : preferred) {
                    Voice best = null;
                    for (Voice v : voices) {
                        if (v.getLocale() == null) continue;
                        boolean langMatch = v.getLocale().getLanguage().equalsIgnoreCase(loc.getLanguage());
                        boolean countryMatch = v.getLocale().getCountry().equalsIgnoreCase(loc.getCountry());
                        if (langMatch && countryMatch) {
                            if (best == null || v.getQuality() > best.getQuality()) {
                                best = v;
                            }
                        }
                    }
                    if (best != null) {
                        tts.setVoice(best);
                        return;
                    }
                }
            }
        } catch (Exception ignored) {
        }

        for (Locale loc : preferred) {
            int res = tts.setLanguage(loc);
            if (res != TextToSpeech.LANG_MISSING_DATA && res != TextToSpeech.LANG_NOT_SUPPORTED) {
                return;
            }
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        float rate = call.getFloat("rate", 0.96f);
        float pitch = call.getFloat("pitch", 1.06f);
        if (ready && tts != null && text != null && !text.isEmpty()) {
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "retro_1930_tts");
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (tts != null) {
            tts.stop();
        }
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        super.handleOnDestroy();
    }
}
