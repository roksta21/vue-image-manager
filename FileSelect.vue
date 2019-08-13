<template>
  <div class="my-modal" id="file-select">
    <transition name="modal" v-if="showModal">
      <div class="modal-mask">
        <div class="modal-wrapper" @click="close">
          <div class="modal-container">
            <a href="#" class="modal-close" @click.prevent="$emit('close')">
              <i class="fa fa-times"></i>
            </a>
            <div class="modal-header">
              <h4>Select File</h4>
            </div>
            <div class="modal-body">
              <div class="navigation">
                <ul>
                  <li>
                    <a href="#" @click.prevent="goBack" class="btn btn-primary btn-sm">
                      <i class="fa fa-caret-left"></i> Back
                    </a>
                  </li>
                  <li>
                    <a href="#" @click.prevent>Home /</a>
                  </li>
                  <li v-for="(crumb, i) in breadcrumbs" :key="i">
                    <a href="#" @click.prevent>{{ crumb }} /</a>
                  </li>
                  <li class="float-right">
                    <a href="#" class="btn btn-primary btn-sm" @click.prevent="selectFiles">
                      <i class="fa fa-upload"></i> Upload
                    </a>
                    <input
                      type="file"
                      style="display: none"
                      ref="upload_files"
                      @input="uploadFiles"
                      multiple
                      id="file_uploads_selector"
                    />
                  </li>
                  <li class="float-right" style="margin-right: 1rem;">
                    <a
                      href="#"
                      class="btn btn-primary btn-sm"
                      @click.prevent="show_add_folder = !show_add_folder"
                    >
                      <i class="fa fa-plus"></i> Folder
                    </a>
                    <div class="add-folder" v-if="show_add_folder">
                      <input type="text" placeholder="Name" v-model="new_folder" />
                      <button class="btn btn-primary btn-sm" @click.prevent="addFolder">save</button>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="images" v-if="is_loaded">
                <div class="image" v-for="(dir, i) in dirs" :key="`folder_${i}`">
                  <a href="#" @click.prevent="fetchDir(dir)">
                    <span class="preview">
                      <i class="fa fa-folder-o"></i>
                    </span>
                    <span class="name">{{ dir }}</span>
                  </a>
                </div>
                <div class="image" v-for="(file, i) in files" :key="`file_${i}`">
                  <input
                    :type="multiple ? 'checkbox' : 'radio'"
                    :id="`file_${file.id}`"
                    :value="file"
                    v-model="selected_files"
                    style="display: none;"
                  />
                  <label :for="`file_${file.id}`">
                    <span class="preview">
                      <img :src="file.url" :alt="$_truncate.line(file.name, 6)" />
                    </span>
                    <span class="name" :title="file.name">{{ $_truncate.line(file.name, 10) }}</span>
                  </label>
                </div>
              </div>
              <div class="loading" v-if="! is_loaded">
                <img src="./loading.gif" alt="loading" />
              </div>
            </div>
            <div class="modal-footer">
              <a href="#" class="btn btn-warning btn-sm" @click.prevent="$emit('close')">Cancel</a>
              <a
                href="#"
                class="btn btn-primary btn-sm"
                @click.prevent="$emit('selected', selected_files)"
              >Okay</a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import './style.scss';

export default {
  mounted() {
    this.fetch();
  },

  data() {
    return {
      files: [],
      dirs: [],
      dir: '',
      is_loaded: false,
      selected_files: [],
      show_add_folder: false,
      new_folder: '',
    };
  },

  props: {
    showModal: {
      type: Boolean,
      default() {
        return true;
      },
    },
    multiple: {
      type: Boolean,
      default() {
        return false;
      },
    },
    server: {
      type: Object,
      default() {
        return { home: '', add_folder: '', file_uploads: '' };
      },
    },
  },

  methods: {
    close(e) {
      if (e.target.className == 'modal-wrapper') {
        this.$emit('close');
      }
    },

    fetch() {
      this.is_loaded = false;
      this.selected_files = [];

      this.$axios.get(this.server.home + '?path=' + this.dir).then(response => {
        this.files = response.data.files;
        this.dirs = response.data.dirs;
        this.is_loaded = true;
      });
    },

    fetchDir(dir) {
      this.dir += dir + '/';
      this.fetch();
    },

    goBack() {
      let deep = this.dir.split('/');
      this.dir = deep.splice(deep.length - 1, 1).join('/');
      this.fetch();
    },

    addFolder() {
      let data = {
        path: this.dir,
        name: this.new_folder,
      };

      axios.post(this.server.add_folder, data).then(response => {
        this.show_add_folder = false;
        this.dirs.push(this.new_folder);
        this.new_folder = '';
      });
    },

    selectFiles() {
      let input_field = document.getElementById('file_uploads_selector');
      input_field.click();
    },

    uploadFiles() {
      let files = this.$refs.upload_files.files;
      
      let data = new FormData();
      data.append('path', this.dir);

      for (var i = 0; i < files.length; i++) {
        let file = files[i];

        data.append('uploaded_files[' + i + ']', file);
      }

      axios.post(this.server.file_uploads, data, { headers: {'content-type': 'multipart/form-data' }}).then(response => {
        this.fetch();
      });
    },
  },

  computed: {
    breadcrumbs() {
      return this.dir.split('/').filter(crumb => {
        return crumb != '';
      });
    },
  },

  watch: {
    show_modal(newval, oldval) {
      if (newval) {
        this.fetch();
      }
    },
  },
};
</script>