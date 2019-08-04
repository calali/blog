###需求背景
展示用户上传的视频的缩略图列表。实现这个的需求的方法有多种：
1，纯前端生成，canvas截取视频。
2，第三方服务接口生成。如很多云服务。
3，ffmpeg可以在后端对视频做处理生成。

###实现效果
本文介绍第一种方法。canvas生成的视频列表如下：
![demo](./demo.jpg)
示例代码地址：

###实现步骤
1，file上传后在获取视频数据，使用canvas渲染。
2，截取canvas渲染的定时视频为图片，展示图片列表。

###原理
使用canvas的drawImage渲染视频，将视频播放到对应的时间，截取图片。
`
const canvas = _document.querySelector('canvas')    
const canvasCtx = canvas.getContext('2d');
canvasCtx.drawImage(video, 0, 0, videoWidth, videoHeight)
const cover = canvas.toDataURL('image/jpeg', 1.0)
`

###注意点
1,video的加载事件顺序
timeupdate是视频的currentTime改变时触发的。在上传视频的过程中，timeupdate为0的时候会触发一次，此时还没有渲染好canvas，因此不能进行canvas截图。在canplay获取视频的宽、高、时长后再进行第一次截图。
