<template>
  <div :style="{'background-image': `url(${require('@/assets/event2.jpg')})`, 'background-repeat':'repeat', 'background-attachment':'fixed', 'background-position':'center top', 'background-size':'cover', 'paddingBottom': '100px'}">
    <div class="container" style="padding-top: 50px">
      <div id="form" class="row justify-content-center"  style="margin-left: 200px">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">Modify event</div>
            <div class="card-body">

              <div class="form-group">
                <label for="title" class="cols-sm-2 control-label">Title</label>
                <div class="cols-sm-10">
                  <div class="input-group">

                    <input type="text" class="form-control" name="name" id="title" placeholder="Enter your event title" v-model="title"/>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="description" class="cols-sm-2 control-label">Description</label>
                <div class="cols-sm-10">
                  <div class="input-group">

                    <textarea class="form-control" name="name" id="description" placeholder="Enter your event description" v-model="description"></textarea>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="date" class="cols-sm-2 control-label">Date</label>
                <div class="cols-sm-10">
                  <div class="input-group">
                    <input type="date" class="form-control" name="name" id="date" placeholder="Enter your event date" v-model="date"/>
                    <input type="time" class="form-control" name="name" id="time" placeholder="Enter your event time" v-model="time"/>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="categories" class="cols-sm-2 control-label">Categories</label>
                <div class="cols-sm-10">
                  <p>
                    <button class="btn btn-outline-success my-2 my-sm-0" @click="toggleCategoriesView">Show categories</button>
                  </p>
                  <div class="container" id="categories" v-bind:style="{'display': (catToggled? 'inline-block' : 'none')}">
                    <form class="form-check-inline" v-for="category in categories" v-bind:key = category.id>
                      <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" :id="category.id" :value="category.name" @click="toggleCategory(category.id)" v-if="category.checked===true" checked>
                        <input class="form-check-input" type="checkbox" :id="category.id" :value="category.name" @click="toggleCategory(category.id)" v-else>
                        <label class="form-check-label" :for="category.id">{{category.name}}</label>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="userImage" class="cols-sm-2 control-label">Event image</label>
                <div class="cols-sm-10">
                  <div class="input-group">
                    <div class="custom-file">
                      <input type="file" class="custom-file-input" id="userImage" @change="onFileSelected">
                      <label class="custom-file-label" for="userImage" v-if="selectedImage!==undefined">{{ selectedImage.name }}</label>
                      <label class="custom-file-label" for="userImage" v-else>Choose file</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="maxCapacity" class="cols-sm-2 control-label">Maximum capacity</label>
                <div class="cols-sm-10">
                  <div class="input-group">

                    <input type="number" step="1" class="form-control" name="name" id="maxCapacity" placeholder="Enter your event maximum capacity" v-model="capacity"/>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="eventType" class="cols-sm-2 control-label">Event type</label>
                <div class="cols-sm-10">
                  <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="eventType" data-bs-toggle="dropdown" aria-expanded="false">
                      {{onlineMsg}}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="eventType">
                      <li><a class="dropdown-item" @click="toggleOnline">Online</a></li>
                      <li><a class="dropdown-item" @click="toggleOnline">In-person</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="url" class="cols-sm-2 control-label">URL</label>
                <div class="cols-sm-10">
                  <div class="input-group">

                    <input type="url" class="form-control" name="name" id="url" placeholder="Enter your event URL" v-model="url"/>
                  </div>
                </div>
              </div>


              <div class="form-group">
                <label for="venue" class="cols-sm-2 control-label">Venue</label>
                <div class="cols-sm-10">
                  <div class="input-group">

                    <input type="text" class="form-control" name="name" id="venue" placeholder="Enter your event venue" v-model="venue"/>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="attendanceCtrl" class="cols-sm-2 control-label">Attendance control required?</label>
                <div class="cols-sm-10">
                  <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="attendanceCtrl" data-bs-toggle="dropdown" aria-expanded="false">
                      {{ attendanceMsg }}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="eventType">
                      <li><a class="dropdown-item" @click="toggleAttendCtrl">Yes</a></li>
                      <li><a class="dropdown-item" @click="toggleAttendCtrl">No</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="cost" class="cols-sm-2 control-label">Fee</label>
                <div class="cols-sm-10">
                  <div class="input-group">

                    <input type="number" class="form-control" name="name" id="cost" placeholder="Enter your event fee" v-model="fee"/>
                  </div>
                </div>
              </div>
              <div class="form-group ">
                <button type="button" class="btn btn-primary btn-lg btn-block login-button" @click="updateEvent">Update</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div id="alert" v-if="showError" style="padding-left: 500px; padding-right: 500px; margin-top: 20px">
      <div class="alert alert-danger" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="showError=false">
          <span aria-hidden="true">&times;</span>
        </button>
        <strong>Oh no! Something went wrong!</strong> {{ errorMessage }}
      </div>
    </div>
  </div>

</template>

<script>
import axios from "axios";

export default {
  name: "MyEvents",
  data() {
    return {
      eventId: this.$route.params.id,
      title: '',
      description: '',
      categoryIds: [],
      date: '',
      time: '',
      isOnline: false,
      url: '',
      venue: '',
      capacity: 0,
      attendCtrl: false,
      fee: 0,
      selectedImage: undefined,
      catToggled: false,
      categories: [],
      attendanceMsg: "No",
      onlineMsg: "In-person",
      errorMessage: '',
      showError: false
    }
  },
  mounted() {
    if (localStorage.token === undefined) {
      this.$router.push("/");
    } else {
      this.getDetails();
    }
  },
  methods: {
    getDetails() {
      axios.get('http://localhost:4941/api/v1/events/' + this.eventId) //http://csse-s365docker1.canterbury.ac.nz <-- Try this if needed
          .then((response) => {
            this.title = response.data["title"];
            this.description = response.data["description"];
            this.categoryIds = response.data["categories"];
            this.date = response.data["date"].slice(0, 16);
            if (parseInt(response.data["isOnline"]) === 1) {
              this.onlineMsg = "Online";
              this.isOnline = true;
            } else {
              this.isOnline = false;
            }
            this.url = response.data["url"];
            if (this.url === null || this.url === undefined) {
              this.url = '';
            }
            this.venue = response.data["venue"];
            this.capacity = response.data["capacity"];
            if (parseInt(response.data["requiresAttendanceControl"]) === 1) {
              this.attendanceMsg = "Yes"
              this.attendCtrl = true;
            } else {
              this.attendCtrl = false;
            }
            this.fee = parseFloat(response.data["fee"]);
            this.getCategories();
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    getCategories() {
      axios.get('http://localhost:4941/api/v1/events/categories')
          .then((response) => {
            this.categories = response.data;
            var i;
            for (i = 0; i < this.categories.length; i++) {
              if (this.categoryIds.includes(this.categories[i]["id"])) {
                this.categories[i]["checked"] = true;
              } else {
                this.categories[i]["checked"] = false;
              }
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    toggleCategory(catId) {
      let i;
      for (i = 0; i < this.categories.length; i++) {
        if (this.categories[i]["id"] == catId) {
          this.categories[i]["checked"] = !this.categories[i]["checked"];
        }
      }
    },
    toggleCategoriesView() {
      this.catToggled = !this.catToggled;
    },
    onFileSelected(event) {
      this.selectedImage = event.target.files[0];
    },
    isImage(ext) {
      switch (ext.toLowerCase()) {
        case 'jpg':
        case 'gif':
        case 'jpeg':
        case 'png':
          //etc
          return true;
      }
      return false;
    },
    eventImg(eventId) {
      if (this.selectedImage !== undefined) {
        const fileExt = this.selectedImage.name.split('.')[this.selectedImage.name.split('.').length-1]
        if (this.isImage(fileExt)) {
          axios.put('http://localhost:4941/api/v1/events/' + eventId + '/image', this.selectedImage, {headers: {'X-Authorization': localStorage.token, 'Content-Type': this.selectedImage.type}})
              .then((response) => {
                if (response.status === 201 || response.status === 200) {
                  this.$router.push("/event/"+this.eventId);
                  // this.$router.push("/events");
                  //Say upload is successful!
                } else {
                  //Check for potential errors
                }
              })
        } else {
          //Show modal for invalid file format
          this.errorMessage = "Only JPEG, PNG, and GIF images are accepted!";
          this.showError = true;
        }
      }
    },
    toggleOnline() {
      this.isOnline = !this.isOnline;
      if (this.isOnline) {
        this.onlineMsg = "Online";
      } else {
        this.onlineMsg = "In-person";
      }
    },
    toggleAttendCtrl() {
      this.attendCtrl = !this.attendCtrl;
      if (this.attendCtrl) {
        this.attendanceMsg = "Yes";
      } else {
        this.attendanceMsg = "No";
      }
    },
    dateInFuture(someDate) {
      let current = new Date();
      let parsedDate = Date.parse(someDate);
      if(current <= parsedDate) {
        return true;
      }
      return false;
    },
    validateChanges() {
      //Title checking
      if (this.title.length === 0) {
        this.errorMessage = "Please enter the event's title!";
        this.showError = true;
        return false;
      }
      //Description checking
      if (this.description.length === 0) {
        this.errorMessage = "Please enter the event's description!";
        this.showError = true;
        return false;
      }
      //Date checking
      if (this.date.length === 0 || this.time.length === 0) {
        this.errorMessage = "Date AND Time must be entered!";
        this.showError = true;
        return false;
      } else {
        this.date = this.date + 'T' + this.time;
        if (!this.dateInFuture(this.date)) {
          this.errorMessage = "Date must be in future!";
          this.showError = true;
          return false;
        }
      }
      //Check date is valid
      if (!this.dateInFuture(this.date)) {
        this.errorMessage = "You cannot change the event's date before today's date!";
        this.showError = true;
        return false;
      }
      //Check at least one category is selected
      this.categoryIds = []
      this.capacity = parseInt(this.capacity);
      let i;
      for (i = 0; i < this.categories.length; i++) {
        if (this.categories[i]["checked"] === true) {
          this.categoryIds.push(this.categories[i]["id"]);
        }
      }
      //Category checking
      if (this.categoryIds.length === 0) {
        this.errorMessage = "Please select at least one category";
        this.showError = true;
        return false;
      }
      //URL checking
      if (this.isOnline && this.url.length === 0) {
        this.errorMessage = "Please enter the event's URL!";
        this.showError = true;
        return false;
      }
      //Venue checking
      if (!this.isOnline && this.venue.length === 0) {
        this.errorMessage = "Please enter the event's venue!";
        this.showError = true;
        return false;
      }
      //All good!
      return true;
    },
    updateEvent() {
      //Do checking first
      if (this.validateChanges()) {
        axios.patch('http://localhost:4941/api/v1/events/' + this.eventId,
        {title: this.title,
              description: this.description,
              categoryIds: this.categoryIds,
              date: this.date,
              isOnline: this.isOnline,
              url: this.url,
              venue: this.venue,
              capacity: this.capacity,
              requiresAttendanceControl: this.attendCtrl,
              fee: parseFloat(this.fee)},
      {headers: {'X-Authorization': localStorage.token, 'Content-Type': 'application/json'}})
            .then((response) => {
              if (response.status === 200) {
                if (this.selectedImage !== undefined) {
                  this.eventImg(this.eventId);
                } else {
                  this.$router.push("/event/"+this.eventId);
                }
              }
            }, () => {
              this.errorMessage = "Invalid event params.";
              this.showError = true;
            });
      }
    }
  }
}
</script>

<style scoped>
body {
  background-color: #302836;
}
#form {
  opacity: 0.95;
  transition: all 0.8s ease-in-out;
}
#form:hover {
  opacity: 1;
}

#alert {
  opacity: 0.80;
  transition: all 0.8s ease-in-out;
}
#alert:hover {
  opacity: 1;
}
</style>