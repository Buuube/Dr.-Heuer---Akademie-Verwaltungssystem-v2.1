<script setup>
import { ref } from 'vue';

import ModuleList from '../components/modules/ModuleList.vue';
import ModuleDetail from '../components/modules/ModuleDetail.vue';
import { deleteModule } from '../services/moduleService';

const selected = ref(null);
const mode = ref('list');
// list | detail
const reloadKey = ref(0);

const select = (module) => {
  selected.value = { ...module };
  mode.value = 'detail';
};

const edit = (module) => {
  selected.value = { ...module };
  mode.value = 'list';
};

const remove = async (moduleCode) => {
  await deleteModule(moduleCode);
  selected.value = null;
  reloadKey.value++;
};

const close = () => {
  selected.value = null;
  mode.value = 'list';
};
</script>

<template>
  <div class="module-layout">
    <div class="list-panel">
      <ModuleList
        v-if="mode === 'list'"
        :key="reloadKey"
        :OnEdit="edit"
        :OnDelete="remove"
        :OnSelect="select"
      />

      <ModuleDetail
        v-if="mode === 'detail'"
        :Module="selected"
        @edit="edit(selected)"
        @close="close"
      />
    </div>
  </div>
</template>
