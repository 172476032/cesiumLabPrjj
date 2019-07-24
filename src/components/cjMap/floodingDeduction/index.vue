<template>
  <div class="flooding-deduction">
    <ButtonGroup class="btngroups">
      <Button @click="replayFlooding">重播</Button>
      <Button @click="beginFlooding">开始</Button>
      <Button @click="endFlooding">结束</Button>
    </ButtonGroup>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  components: {},
  mounted() {},
  computed: {},
  methods: {
    replayFlooding() {
      this.$emit("replayFlooding");
    },
    beginFlooding() {
      this.$emit("beginFlooding");
    },
    endFlooding() {
      this.$emit("endFlooding");
    }
  },
  destroyed() {}
};
</script>

<style lang="scss"  >
.flooding-deduction {
  .btngroups {
    position: absolute;
    left: 45%;
    bottom: 80px;
  }
}
</style>
