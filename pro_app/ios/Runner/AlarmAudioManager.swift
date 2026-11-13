import AVFoundation
import AudioToolbox

final class AlarmAudioManager {
    private var timer: Timer?
    private var isPlaying = false

    func startPlayback(volume: Double) {
        stopPlayback()
        isPlaying = true
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, options: [.duckOthers])
        try? session.setActive(true)

        // Triggers repeating alert chime cleanly while foreground/active audio session holds
        AudioServicesPlaySystemSound(1005)
        timer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            guard let self, self.isPlaying else { return }
            AudioServicesPlaySystemSound(1005)
        }
    }

    func stopPlayback() {
        isPlaying = false
        timer?.invalidate()
        timer = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
