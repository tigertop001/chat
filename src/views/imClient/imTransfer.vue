<!-- 转接 -->
<template lang="pug">
    .imTransfer-wrapper
        main.main
            el-radio-group.item-group(v-model="selectedServerChatId")
                .item(v-for="(item, index) in kfList" :key="index")
                    el-radio-button(:label="item.serverChatId") {{item.serverChatName}}
        footer.footer
            el-button(type="primary" :disabled="selectedServerChatId == ''" @click="submit") 开始咨询

</template>

<script>
export default {
    data() {
        return {
            kfList: [], // 转人工队列集合
            selectedServerChatId: '' // 选中的serverChatId
        };
    },
    computed: {},
    watch: {},
    methods: {
        /**
         * init
         */
        init: function() {
            this.$http.get({
                url: 'getIMServerList',
                successCallback: (res) => {
                    this.$data.kfList = res;
                }
            });
            this.$data.selectedServerChatId = '';
        },

        /**
         * 队列dialog_提交
         */
        submit: function() {
            this.$emit('submit', {
                serverChatId: this.$data.selectedServerChatId
            });
        }
    },
    mounted() {}
};
</script>

<style lang="stylus">
.imTransfer-wrapper {
    .main {
        height: 200px;
        border-bottom: 1px solid #ebeff3;
        .item {
            float: left;
            text-align: center;
            padding: 30px 21px 0px;
            .el-radio-button__inner {
                display: inline-block;
                width: 121px;
                font-size: 14px;
                color: #3e3e3e;
                white-space: nowrap;
                text-overflow: ellipsis;
                border-radius: 5px;
                overflow: hidden;
            }
            .el-radio-button.is-active {
                .el-radio-button__inner {
                    color: #00a8d7;
                    background-color: #fff;
                }
            }
        }
    }
    .footer {
        text-align: center;
        padding: 14px 0px;
    }
}
</style>
