// export function DownloadCanvas(){
//     let canvas = document.getElementById('canvas');
//     let ctx = canvas.getContext('2d');

//     document.getElementById('download').addEventListener('click', function(e) {
//         // Convert our canvas to a data URL
//         let canvasUrl = canvas.toDataURL();
//         // Create an anchor, and set the href value to our data URL
//         const createEl = document.createElement('a');
//         createEl.href = canvasUrl;
    
//         // This is the name of our downloaded file
//         createEl.download = "download-this-canvas";
    
//         // Click the download button, causing a download, and then remove it
//         createEl.click();
//         createEl.remove();
//     });
// }