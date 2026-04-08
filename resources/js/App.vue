<template>
  <h1>Hello2</h1>
</template>

<script>
export default {
  name: "App",
  // Указываем Vue, какие данные мы хотим "впрыснуть" в этот компонент
  inject: ['config'],

  methods: {
    // твои методы
  },

  mounted() {
    // В Options API к inject-данным обращаемся через this
    if (this.config) {
      console.log('ID выборов:', this.config.electionId);
      console.log('Токен:', this.config.apiToken);
    } else {
      console.error('Config не найден!');
    }
  }
}
</script>

<style scoped>

</style>