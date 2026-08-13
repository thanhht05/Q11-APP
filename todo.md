1. Tên hệ thống

MP3 Player Web App

2. Mục tiêu

Xây dựng một ứng dụng web bằng HTML, CSS và JavaScript cho phép người dùng phát và quản lý các file MP3 với giao diện đơn giản, dễ sử dụng.

3. Actor

User

Người dùng sử dụng ứng dụng để nghe các file MP3.

4. Các Use Case chính
UC01 – Chọn và phát file MP3

Mô tả: Người dùng chọn một file MP3 và bắt đầu phát.

Luồng chính:

Người dùng mở ứng dụng.
Người dùng chọn file MP3 từ máy tính hoặc danh sách có sẵn.
Hệ thống tải file.
Người dùng nhấn Play.
Hệ thống phát file MP3.
UC02 – Tạm dừng / tiếp tục phát

Mô tả: Người dùng có thể tạm dừng hoặc tiếp tục file đang nghe.

Luồng chính:

File MP3 đang được phát.
Người dùng nhấn Pause.
Hệ thống tạm dừng tại vị trí hiện tại.
Người dùng nhấn Play.
Hệ thống tiếp tục phát từ vị trí đã dừng.
UC03 – Tua file MP3

Mô tả: Người dùng có thể tua đến vị trí mong muốn trong file.

Luồng chính:

File MP3 đã được tải.
Hệ thống hiển thị thanh tiến trình.
Người dùng kéo thanh tiến trình hoặc nhấn vào vị trí muốn nghe.
Hệ thống chuyển đến thời gian tương ứng.
File tiếp tục phát từ vị trí mới.
UC04 – Lặp lại một file

Mô tả: Người dùng có thể bật chế độ lặp lại file MP3 hiện tại.

Luồng chính:

Người dùng chọn chế độ Repeat One.
File MP3 được phát.
Khi file kết thúc, hệ thống tự động phát lại file đó từ đầu.
Quá trình tiếp tục cho đến khi người dùng tắt chế độ lặp.
UC05 – Tự động phát lại khi hết

Mô tả: Khi file MP3 kết thúc, hệ thống có thể tự động phát lại.

Luồng chính:

Người dùng bật chế độ Auto Repeat.
File MP3 phát đến cuối.
Hệ thống tự động đưa thời gian về 0.
File được phát lại từ đầu.
UC06 – Phát ngẫu nhiên

Mô tả: Người dùng có thể phát các file MP3 theo thứ tự ngẫu nhiên.

Điều kiện: Có nhiều hơn một file MP3 trong danh sách.

Luồng chính:

Người dùng bật Shuffle.
File hiện tại kết thúc.
Hệ thống chọn ngẫu nhiên một file khác trong danh sách.
Hệ thống tự động phát file được chọn.
Tiếp tục cho đến khi người dùng tắt Shuffle.
UC07 – Chuyển bài tiếp theo

Mô tả: Người dùng chuyển sang file MP3 tiếp theo.

Luồng chính:

Người dùng nhấn Next.
Hệ thống xác định file tiếp theo.
File hiện tại dừng.
File tiếp theo được phát.

Nếu đang bật Shuffle, hệ thống chọn một file ngẫu nhiên.

UC08 – Quay lại bài trước

Mô tả: Người dùng quay lại file MP3 trước đó.

Luồng chính:

Người dùng nhấn Previous.
Hệ thống xác định file trước.
Hệ thống phát file đó.
UC09 – Điều chỉnh âm lượng

Mô tả: Người dùng có thể tăng, giảm hoặc tắt âm thanh.

Luồng chính:

Người dùng kéo thanh Volume.
Hệ thống thay đổi âm lượng tương ứng.

Người dùng cũng có thể nhấn Mute để tắt âm thanh.

UC10 – Xem thông tin file đang phát

Mô tả: Hệ thống hiển thị thông tin cơ bản của file MP3.

Bao gồm:

Tên file.
Thời gian hiện tại.
Tổng thời lượng.
Trạng thái Play/Pause.
Trạng thái Repeat.
Trạng thái Shuffle.
5. Quy tắc hoạt động

Khi file kết thúc:

Nếu Repeat One = ON → phát lại chính file hiện tại.
Nếu Shuffle = ON → chọn file ngẫu nhiên và phát.
Nếu cả Repeat và Shuffle đều OFF → chuyển sang file tiếp theo.
Nếu là file cuối cùng và bật Auto Repeat Playlist → quay lại file đầu tiên.

Ưu tiên xử lý có thể là:

Repeat One → Shuffle → Next Song → Repeat Playlist

6. Yêu cầu giao diện

Giao diện cần đơn giản và dễ sử dụng.

Màn hình chính nên có:

---------------------------------------
          MP3 PLAYER

        Song Name.mp3

      01:25 / 04:30

   --------●----------------

   ⏮     ▶ / ⏸      ⏭

   🔁 Repeat      🔀 Shuffle

   🔊 --------●----------

        Playlist
---------------------------------------
Song 1.mp3
Song 2.mp3
Song 3.mp3
---------------------------------------

Các nút chính nên có kích thước đủ lớn và dễ nhận biết.

7. Công nghệ đề xuất
HTML5: xây dựng giao diện.
CSS3: thiết kế giao diện.
JavaScript: xử lý logic.
HTML5 Audio API: phát và điều khiển MP3.

Ví dụ đối tượng chính:

const audio = new Audio();

Các API thường dùng:

audio.play();
audio.pause();

audio.currentTime;
audio.duration;

audio.volume;

audio.loop = true;

audio.addEventListener("ended", () => {
    // xử lý khi bài hát kết thúc
});
8. Use Case tổng quát
                    User
                     |
        ----------------------------
        |            |             |
      Play         Seek          Volume
        |
   -------------------------------
   |        |        |           |
 Pause     Next    Previous     Repeat
                     |
                  Shuffle
9. MVP nên làm trước

Phiên bản đầu tiên chỉ cần:

Chọn nhiều file MP3.
Hiển thị playlist.
Play / Pause.
Next / Previous.
Thanh tua.
Hiển thị thời gian.
Repeat One.
Shuffle.
Tự động chuyển bài khi hết.
Điều chỉnh âm lượng.