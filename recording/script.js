navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        let chunks = []
        mediaRecorder.ondataavalaible = function(event) {
            chunks.push(event.data);
        };
        document.querySelector('#record').addEventListener('click', function() {
            mediaRecorder.start();
        });
        document.querySelector('#stop').addEventListener('click', function() {
            mediaRecorder.stop();
        });

        mediaRecorder.addEventListener("stop", function() {
            const audioBlob = new Blob(chunks, {
                type: 'audio/wav'
            });
            const fdata = new FormData();
            fdata.append('audio',audioBlob);
            let status = sendRecord(fdata)
        });
    });
async function sendRecord(record) {
    let promise = await fetch('https://localhost:5000/recording', {
        method: 'POST',
        body: record
    })
}


