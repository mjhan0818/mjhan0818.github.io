document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("camera");
    const overlay = document.getElementById("overlay");
    const upload = document.getElementById("upload");
    const opacity = document.getElementById("opacity");
    const capture = document.getElementById("capture");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // 1. 카메라 화면 가져오기
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("카메라 접근 실패:", err);
        });

    // 2. 이미지 업로드 및 오버레이 적용
    upload.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                overlay.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. 오버레이 투명도 조절
    opacity.addEventListener("input", (event) => {
        overlay.style.opacity = event.target.value;
    });

    // 4. 사진 찍기 기능
    capture.addEventListener("click", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 카메라 화면을 캡처
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 오버레이 이미지도 같이 합성
        if (overlay.src) {
            ctx.globalAlpha = overlay.style.opacity;
            ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1; // 원래대로 복구
        }

        // 이미지 다운로드
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "성지순례.png";
        link.click();
    });
});
