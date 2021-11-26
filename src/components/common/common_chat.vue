<!-- 聊天记录 -->
<template lang="pug">
    .common_chat-wrapper
        .common_chat-inner
            // 聊天记录
            #common_chat_main.common_chat-main(v-if='chatLoaded' ref='common_chat_main')
                .common_chat-main-content
                    .inner
                        div(v-for='(item ,index) in chatInfoEn.msgList' :key='index')
                            // 系统消息
                            .item.sys(v-if="item.role=='sys'")
                                // 1)文本类型
                                .text-content(v-if="item.contentType=='text'")
                            // 客户、客服
                            .item(v-else='' :class='{ sender: item.role == oprRoleName, receiver: item.role != oprRoleName }')
                                .info-wrapper(:class='item.state')
                                    // 头像
                                    .avatar-wrapper
                                        img.kf-img(:src='item.avatarUrl')
                                    // 1)文本类型
                                    .item-content.common_chat_emoji-wrapper-global(v-if="item.contentType=='text'")
                                        p.text(v-html='getqqemojiEmoji(item.content)')
                                    // 2)图片类型
                                    .item-content(v-else-if="item.contentType=='image'")
                                        img.img(:src='item.fileUrl' @click='imgViewDialog_show(item)')
                                    // 3)文件类型
                                    .item-content(v-else-if="item.contentType=='file'")
                                        .file
                                            i.file-icon.iconfont.fa.fa-file
                                            .file-info
                                                p.file-name {{getFileName(item.fileName)}}
                                            .file-opr
                                                div(v-show="item.state=='success'")
                                                    a.file-download(:href='item.fileUrl' target='_blank' :download='item.fileUrl') &#x4E0B;&#x8F7D;
                                    // 4)文本类型
                                    .item-content.common_chat_emoji-wrapper-global(v-if="item.contentType=='transformServer'")
                                        p.text
                                            | 当前没有配置机器人，
                                            button(type='text' @click="chatCallback('transformServer')") 转接客服
            
            // 底部区域
            .common_chat-footer
              div.c_wrap
                // 表情、文件选择等操作
                .opr-wrapper
                  //- common-chat-emoji.item(ref='qqemoji', @select='qqemoji_selectFace')
                  //- svg-icon(icon-class='face')
                  el-tooltip(content="评分" placement="bottom" effect="light")
                    i.fa.fa-star-half-full(@click="showRateDialog()")
                  // 表情包
                  
                  span.biaoqing(@click="openEmojiDialog") 
                    i.iconfont.fa.fa-smile-o.float-left
                  // 表情包 -弹框
                  emoji(v-if="emojiFlag",@closeEmoji="closeEmojiFun",@selectEmoji="selectEmojiFun")
                  form(method='post', enctype='multipart/form-data')
                    input#common_chat_opr_fileUpload(type='file', name='uploadFile', style='display:none;position:absolute;left:0;top:0;width:0%;height:0%;opacity:0;')
                  a.item(href='javascript:void(0)' @click="fileUpload_click('file')")
                      i.iconfont.fa.fa-file-o
                  form(method='post' enctype='multipart/form-data')
                      input#common_chat_opr_fileUpload(type='file' name='uploadFile' style='display:none;position:absolute;left:0;top:0;width:0%;height:0%;opacity:0;')
                // 聊天输入框
                .input-wrapper
                  #common_chat_input.inputContent.common_chat_emoji-wrapper-global(maxlength='500', contenteditable='true', @paste.stop='inputContent_paste', @drop='inputContent_drop', @keydown='inputContent_keydown', @mouseup='inputContent_mouseup', @mouseleave='inputContent_mouseup')
                // 发送按钮
                button.send-btn(type='primary', size='small', :class='chatInfoEn.state', @click='sendText()', :disabled='chatInfoEn.inputContent.length==0') 发送  
            

                // 离线
                .off-wrapper(v-show="chatInfoEn.state=='off' || chatInfoEn.state=='end'")
                    span.content 会话已经结束
        // 图片查看dialog
        el-dialog.imgView-dialog(title='' :visible.sync='imgViewDialogVisible' :modal='false')
            .header
                i.iconfont.fa.fa-remove(@click='imgViewDialog_close')
            .main
                img.img(:src='imgViewDialog_imgSrc')
</template>

<script>
import common_chat_emoji from './common_chat_emoji.vue';
import emoji from '@/components/common/emoji.vue';
import {substringByByte, getByteLength} from "@/util/util"
export default {
    components: {
        commonChatEmoji: common_chat_emoji,
        emoji:emoji,
    },
    props: {
        chatInfoEn: {
            // required: true,
            type: Object,
            default: () => {
                return {
                    inputContent: '', // 本次输入框的消息内容
                    msgList: [] // 消息集合
                }
            }
        },
        oprRoleName: {
            // required: true,
            type: String,
            default: '',
        }, // 操作者名称；e.g. server:服务端、client:客服端
    },
    data() {
        return {
            inputContent_setTimeout: null, // 输入文字时在输入结束才修改具体内容
            selectionRange: null, // 输入框选中的区域
            shortcutMsgList: [], // 聊天区域的快捷回复列表
            imgViewDialogVisible: false, // 图片查看dialog的显示
            imgViewDialog_imgSrc: '', // 图片查看dialog的图片地址
            chatLoaded: false, // chat是否已加载完毕
            emojiFlag:false,//表情包
            inputDom:'',// 输入框
            inputLength:500,// 输入框长度
        };
    },
    computed: {},
    watch: {},
    mounted() {
        this.$nextTick(function () {
            this.$data.chatLoaded = true;
            this.init();
        });
        this.inputDom = document.getElementById('common_chat_input');
    },
    methods: {
        /**
         * 初始化
         * @param {Object} opts 可选对象
         */
        init: function (opts) {
            var self = this;
            // 初始化状态
            document.getElementById('common_chat_input').innerHTML = '';
            // self.$refs.qqemoji.$data.faceHidden = true;

            // 在线状态
            if (this.chatInfoEn.state == 'on') {
                // 1.显示在输入框的内容
                setTimeout(function () {
                    // 未断开获取焦点
                    document.getElementById('common_chat_input').focus();
                    self.setInputContentSelectRange();
                    // 设置之前保存的输入框内容
                    if (self.chatInfoEn.inputContent) {
                        self.setInputDiv(self.chatInfoEn.inputContent);
                    }
                }, 200);
            } else {
                document.getElementById('common_chat_input').blur();
            }

            // 2.滚动到底部
            this.$nextTick(function () {
                self.$refs.common_chat_main.scrollTop = self.$refs.common_chat_main.scrollHeight;
                document.getElementById('common_chat_input').focus();
            });
        },
        /**
         * 显示评论
         */
        showRateDialog: function () {
           this.$emit('showRateDialog',true)
        },
        /**
         * 发送文本
         */
        sendText: function () {
            var self = this;
            if (self.chatInfoEn.inputContent.length == '') {
                return;
            }
            var msgContent = self.chatInfoEn.inputContent;
            document.getElementById('common_chat_input').innerHTML = '';
            self.setInputContentByDiv();
            this.sendMsg({
                contentType: 'text',
                content: msgContent,
            });
        },

        // /**
        //  * 设置输入内容
        //  * 根据input输入框innerHTML转换为纯文本
        //  */
        // setInputContentByDiv_bak: function () {
        //     var self = this;
        //     var htmlStr = document.getElementById('common_chat_input').innerHTML;
        //
        //     // 1.转换表情为纯文本：<img textanme="[笑]"/> => [笑]
        //     var tmpInputContent = htmlStr.replace(/<img .+?text=\"(.+?)\".+?>/g, '[$1]').replace(/<.+?>/g, '');
        //     // 获取字符串长度
        //     let leng = getByteLength(tmpInputContent)
        //     // 2.设置最长长度
        //     if (leng > 500) {
        //         document.getElementById('common_chat_input').innerHTML = '';
        //         var value = tmpInputContent.substr(0, 499).replace(/\[(.+?)\]/g, function (item, value) {
        //             return self.$refs.qqemoji.getImgByFaceName(value);
        //         });
        //         this.setInputDiv(value);
        //     }
        //
        //     // 3.修改store
        //     this.chatInfoEn.inputContent = tmpInputContent;
        // },
        // 3.输入框过滤器
        setInputContentByDiv: function () {
            let htmlStr = this.inputDom.innerHTML;
            // 获取字符串长度
            let leng = getByteLength(htmlStr)
            // 2.设置最长长度
            if (leng > this.inputLength) {
                this.inputDom.innerHTML = '';
                htmlStr = substringByByte(htmlStr, this.inputLength)
                this.setInputDiv(htmlStr);
            }
            // 3.修改store
            this.chatInfoEn.inputContent = htmlStr;

        },

        /**
         * 设置input输入框内容
         * @param {String} vlaue 设置的值
         */
        setInputDiv: function (value) {
            if (this.$data.selectionRange == null) {
                document.getElementById('common_chat_input').focus();
                return;
            }
            // 1.设置selectionRange
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(this.$data.selectionRange);
            } else {
                this.$data.selectionRange && this.$data.selectionRange.select();
            }

            // 2.表情转换为img
            // value = this.getqqemojiEmoji(value);

            // 3.聊天框中是否选中了文本，若选中文本将被替换成输入内容
            if (window.getSelection) {
                var sel, range;
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    // 1)删除选中的文本(内容)
                    range = sel.getRangeAt(0); // 获取鼠标选中的文本区域
                    range.deleteContents(); // 删除选中的文本

                    // 2)创建以输入内容为内容的DocumentFragment
                    var elemnet;
                    if (range.createContextualFragment) {
                        elemnet = range.createContextualFragment(value);
                    } else {
                        // 以下代码等同createContextualFragment
                        // 创建一个DocumentFragment
                        elemnet = document.createDocumentFragment();

                        var divEl = document.createElement('div');
                        divEl.innerHTML = value;
                        // divEl下的元素，依次插入到DocumentFragment
                        for (let i = 0, len = divEl.children.length; i < len; i++) {
                            elemnet.appendChild(divEl.firstChild);
                        }
                    }
                    // 3)选中文本的位置替换为新输入的内容，并把光标定位到新内容后方
                    var lastNode = elemnet.lastChild;
                    range.insertNode(elemnet);
                    range.setStartAfter(lastNode);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            } else if (document.selection && document.selection.type != 'Control') {
                // IE < 9
                document.selection.createRange().pasteHTML(imgStr);
            }

            // 4.修改inputContent
            this.setInputContentByDiv();
        },

        /**
         * 转换为QQ表情
         */
        getqqemojiEmoji: function (value) {
            if (value == undefined) {
                return;
            }
            var self = this;
            let rs = value.replace(/\[(.+?)\]/g, function (item, value) {
                return self.$refs.qqemoji.getImgByFaceName(value);
            });
            return rs;
        },

        /**
         * 设置input输入框的选择焦点
         */
        setInputContentSelectRange: function () {
            if (window.getSelection && window.getSelection().rangeCount > 0) {
                var selectRange = window.getSelection().getRangeAt(0);
                if (
                    selectRange.commonAncestorContainer.nodeName == '#text' &&
                    selectRange.commonAncestorContainer.parentElement &&
                    selectRange.commonAncestorContainer.parentElement.id == 'common_chat_input'
                ) {
                    // 选中了输入框内的文本
                    this.$data.selectionRange = selectRange;
                } else if (selectRange.commonAncestorContainer.id == 'common_chat_input') {
                    // 选中了输入框
                    this.$data.selectionRange = selectRange;
                }
            }
        },

        /**
         * 输入框的mouseup
         */
        inputContent_mouseup: function (e) {
            this.setInputContentSelectRange();
        },

        /**
         * 输入框的keydown
         */
        inputContent_keydown: function (e) {
            // keyup触发时，绑定的数据还没有被变更，需要进行延后访问
            clearTimeout(this.$data.inputContent_setTimeout);
            this.$data.inputContent_setTimeout = setTimeout(() => {
                this.setInputContentByDiv();

                // 若按了回车，直接发送
                if (e.keyCode == 13) {
                    this.sendText();
                }
                this.setInputContentSelectRange();
            }, 1);
        },

        /**
         * 输入框的粘贴
         */
        inputContent_paste: function (e) {
            var self = this;
            var isImage = false;
            if (e.clipboardData && e.clipboardData.items.length > 0) {
                // 1.上传图片
                for (var i = 0; i < e.clipboardData.items.length; i++) {
                    var item = e.clipboardData.items[i];
                    if (item.kind == 'file' && item.type.indexOf('image') >= 0) {
                        // 粘贴板为图片类型
                        var file = item.getAsFile();
                        let formData = new FormData();
                        formData.append('uploadFile', file);
                        this.$http.uploadFile({
                            url: '/upload',
                            params: formData,
                            successCallback: (rs) => {
                                document.getElementById('common_chat_opr_fileUpload').value = '';
                                this.sendMsg({
                                    contentType: 'image',
                                    fileName: rs.fileName,
                                    fileUrl: rs.fileUrl,
                                    state: 'success',
                                });
                            },
                        });
                        isImage = true;
                    }
                }

                // 2.非图片，粘贴纯文本
                if (!isImage) {
                    var str = e.clipboardData.getData('text/plain');
                    // 转化为纯文字
                    var span = document.createElement('span');
                    span.innerHTML = str;
                    var txt = span.innerText;
                    this.setInputDiv(txt.replace(/\n/g, '').replace(/\r/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                }
            }
            e.stopPropagation();
            e.preventDefault();
        },

        /**
         * 文件上传_点击
         */
        fileUpload_click: function (fileType) {
            document.getElementById('common_chat_opr_fileUpload').onchange = this.fileUpload_change;
            document.getElementById('common_chat_opr_fileUpload').click();
        },

        /**
         * 文件上传_选中文件
         */
        fileUpload_change: function (e) {
            var fileNameIndex = document.getElementById('common_chat_opr_fileUpload').value.lastIndexOf('\\') + 1;
            var fileName = document.getElementById('common_chat_opr_fileUpload').value.substr(fileNameIndex);
            var extend = fileName.substring(fileName.lastIndexOf('.') + 1);
            // 1.判断有效
            // 1)大小
            if (document.getElementById('common_chat_opr_fileUpload').files[0].size >= 1000 * 1000 * 10) {
                this.$ak.Msg.toast('文件大小不能超过10M', 'error');
                document.getElementById('common_chat_opr_fileUpload').value = '';
                return false;
            }
            // 2.文件上传
            let formData = new FormData();
            formData.append('uploadFile', document.getElementById('common_chat_opr_fileUpload').files[0]);
            this.$http.uploadFile({
                url: '/upload',
                params: formData,
                successCallback: (rs) => {
                    document.getElementById('common_chat_opr_fileUpload').value = '';
                    this.sendMsg({
                        contentType: ['png', 'jpg', 'jpeg', 'gif', 'bmp'].indexOf(extend) >= 0 ? 'image' : 'file',
                        fileName: fileName,
                        fileUrl: rs.fileUrl,
                        state: 'success',
                    });
                },
            });
        },

        /**
         * qqemoji选中表情
         */
        // qqemoji_selectFace: function (rs) {
        //     var imgStr = rs.imgStr;
        //     this.setInputDiv(imgStr);
        // },

        /**
         * 转换文件名，若文件名称超过9个字符，将进行截取处理
         * @param {String} fileName 文件名称
         */
        getFileName: function (fileName) {
            if (!fileName) {
                return;
            }
            var name = fileName.substring(0, fileName.lastIndexOf('.'));
            var extend = fileName.substring(fileName.lastIndexOf('.') + 1);
            if (name.length > 9) {
                name = name.substring(0, 3) + '...' + name.substring(name.length - 3);
            }
            return name + '.' + extend;
        },

        /**
         * 图片查看dialog_显示
         */
        imgViewDialog_show: function (item) {
            this.$data.imgViewDialogVisible = true;
            this.$data.imgViewDialog_imgSrc = item.fileUrl;
        },

        /**
         * 图片查看dialog_显示
         */
        imgViewDialog_close: function () {
            this.$data.imgViewDialogVisible = false;
            var self = this;
            setTimeout(function () {
                self.$data.imgViewDialog_imgSrc = '';
            }, 100);
        },

        /**
         * 输入框的拖拽
         */
        inputContent_drop: function (e) {
            var self = this;
            setTimeout(function () {
                self.setInputContentByDiv();
            }, 100);
        },

        /**
         * 发送消息，e.g. 文本、图片、文件
         * @param {Object} msg 消息对象
         */
        sendMsg: function (msg) {
            var self = this;
            // 1.传递
            this.$emit('sendMsg', {
                msg: msg,
                successCallbcak: function () {
                    document.getElementById('common_chat_input').focus();
                    self.goEnd();
                },
            });
        },

        /**
         * 传递回调
         */
        chatCallback: function (emitType, data) {
            this.$emit('chatCallback', {
                eventType: emitType,
                data: data,
            });
        },

        /**
         * 聊天记录滚动到底部
         */
        goEnd: function () {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.$refs.common_chat_main.scrollTop = this.$refs.common_chat_main.scrollHeight;
                }, 100);
            });
        },


        // 关闭表情包
        closeEmojiFun() {
            this.emojiFlag = false;
        },
        // 打开表情包
        openEmojiDialog() {
            this.emojiFlag = true;
        },
        // 选中表情包
        selectEmojiFun(emoji) {
            this.setInputDiv(emoji)
            this.closeEmojiFun();
        },
    },
};
</script>
<style lang="stylus">
//  .c-body
//   height 44px
//   background-color #ffffff
//   width 100%
.common_chat-footer
  position fixed
  bottom 0px
  background-color #ffffff
  .c_wrap
    display flex
    justify-content space-between
    width 100%
    align-items flex-end
    padding 5px 0px
.opr-wrapper
  width 75px
  display flex
  align-items: center
  justify-content space-between
  svg
    width 20px
    height 20px
    color #c8c8d2
.common_chat-footer
  min-height 30px
  width 100%
  display flex
  align-items: center
  align-content: center
.input-wrapper
  width calc(100% - 180px)
  overflow hidden
  background-color: #f5f5fc;
  border-radius: 17px;
  padding 2px 15px
  display flex
  align-items: center
  align-content: center
  justify-content space-between
  .inputContent
    outline none
    min-height 20px
    overflow-y: auto
    width 70%
  .up-file
    width 15%
    height 20px
    text-align: center
    svg
      width 18px
      height 18px
      color #c8c8d2

.biaoqing
  font-size 24px
  color #c8c8d2

.send-btn
  width 85px
  border none
  margin-left 5px
  margin-right 5px
.on
  width: 80px
  height: 34px
  background-color: #30e318
  border-radius: 17px





 .inner
   .item
    clear: both
    overflow: hidden
    margin-bottom 5px
.receiver
    margin-top: 18px;
    font-size: 12px;
    .info-wrapper
      display flex
      justify-content: flex-start

.kf-img
  width: 40px
  height: 40px

.item.sender
  .info-wrapper
    .avatar-wrapper
      float: right
    .item-content
      float: right
      margin-left: 10px
      min-height: 30px
      max-width 85%
      padding 5px
      background-image: linear-gradient(225deg,
		#9f75f4 0%,
		#6e5bf3 99%),
	linear-gradient(
		#9f75f4,
		#9f75f4);
      border-radius: 20px 0px 20px 20px;
      color #fff
      text-align: right
    .text
      text-align: right

.common_chat-wrapper
  width 100%
  height 100%
  overflow hidden
  position relative
  font-size 12px
  float left
  border 0px
  .common_chat-inner
    width 100%
    height 100%
    .common_chat-main
      position relative
      height calc(100% - 50px)
      overflow-y auto
      overflow-x hidden
      .common_chat-main-header
        padding-top 14px
        text-align center
        .button
          padding 0px
          font-size 12px
          color #8d8d8d
      .common_chat-main-content
        position absolute
        width 100%
        height 100%
        & > .inner
          padding-bottom 20px
          .item
            clear both
            overflow hidden
            &.receiver
              margin-left 5px
              .avatar-wrapper
                margin-right 15px
              .info-wrapper
                .item-content
                  float left
                  color #000000
                  background-image: linear-gradient(225deg,
                  #9f75f4 0%,
                  #6e5bf3 99%),
                  linear-gradient(
                    #9f75f4,
                    #9f75f4);
                  border-radius: 0px 20px 20px 20px;
                  color #fff
                  &::before
                    position absolute
                    top 0px
                    left -10px
                    width 0px
                    height 0px
                    content ''
                    border-top 0px
                    border-right 10px solid #9f75f4
                    border-bottom 5px solid transparent
                    border-left 0px
            &.sender
              margin-right 5px
              .avatar-wrapper
                float right
                margin-left 15px
              .info-wrapper
                float right
                .item-content
                  float right
                  color #fff
                  background-image: linear-gradient(225deg,
                    #9f75f4 0%,
                    #6e5bf3 99%),
                  linear-gradient(
                    #9f75f4,
                    #9f75f4);
                  border-radius: 20px 0px 20px 20px;
                  &::before
                    position absolute
                    top 0px
                    right -10px
                    width 0px
                    height 0px
                    content ''
                    border-top 0px
                    border-right 0px
                    border-bottom 5px solid transparent
                    border-left 10px solid #9f75f4
          .sys
            color #b0b0b0
            font-size 12px
            text-align center
            .text-content
              padding-top 20px
            .myd-content
              .desc
                margin-top 18px
              .text
                color #3e3e3e
                margin-top 12px
              .remark
                margin-top 10px
    .common_chat-footer
      // position relative
      width 100%
      .comm_fb
        display flex
        align-items: center
        justify-content space-between
      .opr-wrapper
        height 30px
        padding 2px
        text-align left
        & > .item
          float left
          font-weight normal
          text-decoration blink
          & > .iconfont
            color #aaa
            font-size 20px
      .input-wrapper
        position relative
        .inputContent
          width 100%
          resize none
          overflow auto
          line-height 1.5
          outline 0px solid transparent
          background-color: #f5f5fc;
          padding 5px

//   width 80%
//   overflow hidden
//   background-color: #f5f5fc;
//   border-radius: 17px;
//   padding 5px 15px
//   display flex
//   align-items: center
//   align-content: center
//   justify-content space-between
//   .inputContent
//     outline none
//     min-height 20px
//     overflow-y: auto
//     width 70%



        .shortcutPopover-wrapper
          position absolute
          top 30px
          left 10px
          width 440px
          max-height 80px
          padding 4px
          font-size 12px
          overflow-y auto
          border 1px solid #9b9aab
          border-radius 3px
          background-color #fff
          cursor pointer
          p
            padding 4px
            &.selected
              background-color #ded1cc
            .key
              display inline-block
              width 50px
              white-space nowrap
              text-overflow ellipsis
              overflow hidden
            .content
              display inline-block
              width 350px
              margin-left 10px
              white-space nowrap
              text-overflow ellipsis
              overflow hidden
            .highlight
              color #00a8d7
        .tips
          position absolute
          top 7px
          left 20px
          width auto
          color #8d8d8d
      // .send-btn
      //   float right
      //   margin-right 16px
      .off-wrapper
        position absolute
        top 0px
        left 0px
        width 100%
        height 100%
        background-color rgba(255,255,255,0.6)
        font-size 14px
        .content
          position absolute
          top 50%
          left 50%
          transform translate(-50%,-50%)

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender
  margin-top 18px
  font-size 12px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .avatar-wrapper,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .avatar-wrapper
  float left

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .avatar-wrapper .kf-img,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .avatar-wrapper .kf-img
  width 40px
  height 40px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper
  position relative
  text-align left
  font-size 12px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content
  position relative
  max-width 330px
  color #3e3e3e
  font-size 13px
  border-radius 3px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .text,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .text
  line-height 1.8
  white-space normal
  word-wrap break-word
  word-break break-all
  padding 10px 12px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .qqemoji,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .qqemoji
  width 24px
  height 24px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .img,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .img
  max-width 320px
  max-height 240px
  white-space normal
  word-wrap break-word
  word-break break-all
  padding 5px
  cursor pointer

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .file,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .file
  width 220px
  padding 10px 8px
  margin 3px
  overflow hidden
  background #fff
  border-radius 5px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .file .el-button,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .file .el-button
  padding 0px
  font-size 12px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .file .file-info,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .file .file-info
  float left
  padding 0px 8px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .file .file-info .file-name,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .file .file-info .file-name
  width 160px
  display inline-block
  color #333333
  white-space nowrap
  text-overflow ellipsis
  overflow hidden
  line-height 1.3

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .file .file-opr,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .file .file-opr
  margin-top 8px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .file .file-icon,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .file .file-icon
  float left
  color #663399
  font-size 40px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .file .file-download,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .file .file-download
  color #00a8d7
  cursor pointer
  text-decoration blink

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .preInput,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .preInput
  position relative
  color #8d8d8d

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .preInput img,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .preInput img
  height 15px
  position relative
  top 3px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueList,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueList
  width 250px
  padding 10px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueList .title,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueList .title
  position relative

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueList .title .content,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueList .title .content
  position absolute
  margin-top -1px
  margin-left 6px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueList .el-collapse-item__wrap,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueList .el-collapse-item__wrap
  background transparent

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueList .el-collapse,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueList .el-collapse
  border 0px
  margin-top 8px
  margin-bottom -8px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueList .el-collapse .el-collapse-item__header,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueList .el-collapse .el-collapse-item__header
  font-size 13px
  background transparent
  color #f7455d
  padding-left 5px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueList .el-collapse .el-collapse-item__wrap .el-collapse-item__content,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueList .el-collapse .el-collapse-item__wrap .el-collapse-item__content
  font-size 12px
  color #3e3e3e
  padding-left 5px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueExtend,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueExtend
  width 250px
  padding 10px 10px 0px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueExtend .main,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueExtend .main
  border-top 1px solid #eeeff0
  margin-top 10px
  padding-top 10px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueExtend .main p,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueExtend .main p
  margin-bottom 5px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueExtend .main .el-button,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueExtend .main .el-button
  font-size 12px
  color #f7455d

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueResult,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueResult
  width 250px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueResult .main,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueResult .main
  padding 10px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueResult .footer,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueResult .footer
  border-top 1px solid #eeeff0
  height 30px

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueResult .footer .btn,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueResult .footer .btn
  width 60px
  margin 0px 30px
  padding 6px 0px
  display inline-block
  text-align center
  font-size 10px
  color #8d8d8d
  cursor pointer
  position relative

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueResult .footer .btn:first-child::after,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueResult .footer .btn:first-child::after
  top 4px
  right -30px
  width 1px
  height 80%
  content ''
  position absolute
  background-color #eeeff0
  z-index 0

.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .receiver .info-wrapper .item-content .issueResult .footer .iconfont,
.common_chat-wrapper .common_chat-inner .common_chat-main .common_chat-main-content > .inner .sender .info-wrapper .item-content .issueResult .footer .iconfont
  font-size 10px
  margin-right 5px

.common_chat-wrapper .common_chat-inner .common_chat-footer .send-btn.off,
.common_chat-wrapper .common_chat-inner .common_chat-footer .send-btn.end
  background-color #ccc
  border-color #ccc

.imgView-dialog
  background #00000080
  height 100%
  .el-dialog
    max-width 75%
    position relative
    background transparent
    box-shadow none
    .el-dialog__header
      display none
    .el-dialog__body
      padding 0px
      text-align center
      position relative
      .header
        text-align right
        position relative
        height 0px
        .fa-remove
          font-size 32px
          color white
          position relative
          right -50px
          top -30px
          cursor pointer
      .main
        .img
          max-width 100%
          max-height 100%
          height 100%


.fa-star-half-empty:before, .fa-star-half-full:before, .fa-star-half-o:before
    font-size: 20px;
    color #afafaf
</style>

