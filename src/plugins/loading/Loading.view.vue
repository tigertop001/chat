<template>
    <div id="loadEffect" class="load-wrap">
        <div class="wrap">
            <div class="spinner-wrap">
                <div class="spinner">
                    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                </div>
            </div>
            <div class="load-f">正在加载</div>
        </div>
        <div class="bg"></div>
    </div>

</template>
<script>
export default {
    name: "myloading"
};
</script>

<style scoped lang="stylus">
.load-wrap
    width 100vw
    height 100vw;
    z-index 10002
    overflow hidden
    position: fixed
    font-size 12px

.wrap {
    // position: absolute;
    position: fixed
    left 50%
    top: 50%
    width 80px
    height 80px
    transform: translate(-50%, -50%)
    background-color rgba(0, 0, 0, 0.5)
    display flex
    align-items  center
    justify-content center
    border-radius 8px
    flex-wrap wrap
    padding 10px 0px
    z-index 11
}

.spinner-wrap {
    margin: auto;
    //zoom 0.3
    transform:scale(0.3);
    width 90px
    position: absolute;
    top -21px
}

.load-f{
    width:100%
    text-align center
    color #ffffff
    position: absolute;
    bottom 12px
}
.spinner {
    height: 100px;
    width: 100px;
    display: inline-block;
    animation: spin 1s steps(12, end) infinite;
}
.spinner:first-child {
    margin-right: 50px;
}
.spinner i {
    height: 20px;
    width: 6px;
    margin-left: -3px;
    display: block;
    transition: height 1s;
    position: absolute;
    left: 50%;
    transform-origin: center 50px;
    background: #ffffff;
    box-shadow: 0 0 3px rgba(255, 255, 255, 1);
    border-radius: 3px;
}
.spinner:nth-child(2) i {
    height: 6px;
}
.spinner:hover i {
    height: 6px;
}
.spinner:hover:nth-child(2) i {
    height: 30px;
}

.spinner i:nth-child(1) {
    opacity: 0.08;
}

.spinner i:nth-child(2) {
    transform: rotate(30deg);
    opacity: 0.167;
}

.spinner i:nth-child(3) {
    transform: rotate(60deg);
    opacity: 0.25;
}

.spinner i:nth-child(4) {
    transform: rotate(90deg);
    opacity: 0.33;
}

.spinner i:nth-child(5) {
    transform: rotate(120deg);
    opacity: 0.4167;
}

.spinner i:nth-child(6) {
    transform: rotate(150deg);
    opacity: 0.5;
}

.spinner i:nth-child(7) {
    transform: rotate(180deg);
    opacity: 0.583;
}

.spinner i:nth-child(8) {
    transform: rotate(210deg);
    opacity: 0.67;
}

.spinner i:nth-child(9) {
    transform: rotate(240deg);
    opacity: 0.75;
}

.spinner i:nth-child(10) {
    transform: rotate(270deg);
    opacity: 0.833;
}

.spinner i:nth-child(11) { transform: rotate(300deg);
    opacity: 0.9167;
}

.spinner i:nth-child(12) {
    transform: rotate(330deg);
    opacity: 1;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
