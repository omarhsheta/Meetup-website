<template>
  <div v-if="eventHasImg" :style="{'background-image': `url(http://localhost:4941/api/v1/events/${eventInfo['id']}/image)`, 'background-repeat':'repeat', 'background-attachment':'fixed', 'background-position':'center top', 'background-size':'cover', 'paddingBottom': '200px', 'paddingTop': '50px'}">
    <div id="form" class="container emp-profile">
      <form method="post">
        <div class="row">
          <div class="col-md-4">
            <div class="profile-img">
              <img alt="Organizer Image"  :src="'http://localhost:4941/api/v1/users/' + eventInfo['organizerId'] + '/image'" v-if="usrHasImg">
              <img alt="Organizer Image" src="@/assets/noprofilepic.png" v-else>
            </div>
          </div>
          <div class="col-md-6">
            <div class="profile-head">
              <h5>
                {{ eventInfo["title"] }}
              </h5>
              <h6>
                Hosted by {{eventInfo["organizerFirstName"]}} {{eventInfo["organizerLastName"]}}
              </h6>
              <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item">
                  <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">About</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="simEvents-tab" data-toggle="tab" href="#similarEvents" role="tab" aria-controls="profile" aria-selected="false">Similar Events</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="attendee-tab" data-toggle="tab" href="#attendees" role="tab" aria-controls="profile" aria-selected="false">Attendees</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-md-2">
            <div class="mt-3 text-center"><button class="btn btn-primary profile-button" type="button" v-if="currentUserIsOrganizer&&dateInFuture(eventInfo['date'])" @click="$router.push('/modifyevent/'+eventId)">Modify Event</button></div>
            <div class="mt-3 text-center"><button class="btn btn-primary profile-button" data-bs-toggle="modal" data-bs-target="#confirmDelete" type="button" v-if="currentUserIsOrganizer&&dateInFuture(eventInfo['date'])">Delete Event</button></div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4">
            <div class="profile-work">
              <p>Categories</p>
              <div v-for="category in getEventCategories()" v-bind:key="category">
                <a>{{ category }}</a>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="tab-content simEvents-tab" id="myTabContent">
              <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <div class="row">
                  <div class="col-md-6">
                    <label>Description</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ eventInfo["description"] }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Date</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{dateParser(eventInfo.date)}}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Time</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ timeParser(eventInfo.date) }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Capacity</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{eventInfo["capacity"]}}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Attendees</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{eventInfo["attendeeCount"]}}</p>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <label>Event type</label>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['isOnline']===1">
                    <p>Online</p>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['isOnline']===0">
                    <p>In-person</p>
                  </div>
                </div>
                <div class="row" v-if="eventInfo['isOnline']===0">
                  <div class="col-md-6">
                    <label>Venue</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ eventInfo['venue'] }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>URL</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ eventInfo['url'] }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Attendance controlled?</label>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['requiresAttendanceControl']===1">
                    <p>Yes</p>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['requiresAttendanceControl']===0">
                    <p>No</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Fee</label>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['fee']==0">
                    <p>free</p>
                  </div>
                  <div class="col-md-6" v-else>
                    <p>${{eventInfo["fee"]}}</p>
                  </div>
                </div>
              </div>
              <div class="tab-pane fade" id="similarEvents" role="tabpanel" aria-labelledby="simEvents-tab">
                <div id="events">
                  <table>
                    <tr class="form-check-inline" v-for="event in similarEvents" v-bind:key = event.eventId>
                      <div class="event">
                        <div class="d-flex align-items-center">
                          <img v-if="event.eventImg" alt="Event Image" style="width:250px; height:250px; text-align:center; vertical-align:middle; margin-right: 50px; margin-left: 30px; margin-top: 15px;" :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'">
                          <img v-else alt="Event Image" style="width:250px; height:250px; text-align:center; vertical-align:middle; margin-right: 50px; margin-left: 30px; margin-top: 15px;" src="@/assets/noEventImg.png">
                          <div class="d-flex flex-column" align="left">
                            <h4 class="title">{{ event.title }}</h4>
                            <p class="date">Date: {{ dateParser(event.date) }}</p>
                            <p class="time">Time: {{ timeParser(event.date) }}</p>
                            <p class="organiser">Organizer: {{ event.organizerFirstName }} {{ event.organizerLastName }}</p>
                            <p class="attendees">Attendees: {{ event.numAcceptedAttendees }}</p>
                          </div>
                        </div>
                      </div>
                    </tr>
                  </table>
                </div>
              </div>
              <div class="tab-pane fade" id="attendees" role="tabpanel" aria-labelledby="simEvents-tab">
                <table class="table">
                  <thead>
                  <tr>
                    <th scope="col">Profile picture</th>
                    <th scope="col">First name</th>
                    <th scope="col">Last name</th>
                    <th scope="col" v-if="currentUserIsOrganizer">Interest date</th>
                    <th scope="col" v-if="currentUserIsOrganizer">Status</th>
                    <th scope="col" v-if="currentUserIsOrganizer">Actions</th>
                  </tr>
                  </thead>
                  <tbody v-for="attendee in attendees" v-bind:key="attendee.attendeeId">
                  <tr>
                    <th scope="row" id="attendeeImg">
                      <img v-if="attendee.imageFile!==null"  style="width:75px; height:75px; text-align:center; margin-left: 175px" :src="'http://localhost:4941/api/v1/users/' + attendee.attendeeId + '/image'">
                      <img v-else style="width:75px; height:75px; text-align:center; margin-left: 175px" src="@/assets/noprofilepic.png">
                    </th>
                    <td>{{attendee.firstName}}</td>
                    <td>{{attendee.lastName}}</td>
                    <td v-if="currentUserIsOrganizer">{{attendee.dateOfInterest}}</td>
                    <td v-if="currentUserIsOrganizer">{{attendee.status}}</td>
                    <td v-if="currentUserIsOrganizer">
                      <a class="btn btn-sq-xs btn-warning" @click="changeAttendance(attendee.attendeeId, 'pending')">
                        <i class="fa fa-question fa-1x"></i><br/>
                      </a>
                      <a class="btn btn-sq-xs btn-success" @click="changeAttendance(attendee.attendeeId, 'accepted')">
                        <i class="fa fa-check fa-1x"></i><br/>
                      </a>
                      <a class="btn btn-sq-xs btn-danger" @click="changeAttendance(attendee.attendeeId, 'rejected')">
                        <i class="fa fa-times fa-1x"></i><br/>
                      </a>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <!-- Modal -->
    <div class="modal fade" id="confirmDelete" tabindex="-1" aria-labelledby="DeleteEvent" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Delete Event</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete your event? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#confirmDelete" @click="deleteEvent">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else :style="{'background-image': `url(${require('@/assets/event3.jpg')})`, 'background-repeat':'repeat', 'background-attachment':'fixed', 'background-position':'center top', 'background-size':'cover', 'paddingBottom': '200px', 'paddingTop': '50px'}">
    <div id="form" class="container emp-profile">
      <form method="post">
        <div class="row">
          <div class="col-md-4">
            <div class="profile-img">
              <img alt="Organizer Image"  :src="'http://localhost:4941/api/v1/users/' + eventInfo['organizerId'] + '/image'" v-if="usrHasImg">
              <img alt="Organizer Image" src="@/assets/noprofilepic.png" v-else>
            </div>
          </div>
          <div class="col-md-6">
            <div class="profile-head">
              <h5>
                {{ eventInfo["title"] }}
              </h5>
              <h6>
                Hosted by {{eventInfo["organizerFirstName"]}} {{eventInfo["organizerLastName"]}}
              </h6>
              <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item">
                  <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">About</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="simEvents-tab" data-toggle="tab" href="#similarEvents" role="tab" aria-controls="profile" aria-selected="false">Similar Events</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="attendee-tab" data-toggle="tab" href="#attendees" role="tab" aria-controls="profile" aria-selected="false">Attendees</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-md-2">
            <div class="mt-3 text-center"><button class="btn btn-primary profile-button" type="button" v-if="currentUserIsOrganizer&&dateInFuture(eventInfo['date'])" @click="$router.push('/modifyevent/'+eventId)">Modify Event</button></div>
            <div class="mt-3 text-center"><button class="btn btn-primary profile-button" data-bs-toggle="modal" data-bs-target="#confirmDelete" type="button" v-if="currentUserIsOrganizer&&dateInFuture(eventInfo['date'])">Delete Event</button></div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4">
            <div class="profile-work">
              <p>Categories</p>
              <div v-for="category in getEventCategories()" v-bind:key="category">
                <a>{{ category }}</a>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="tab-content simEvents-tab" id="myTabContent">
              <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <div class="row">
                  <div class="col-md-6">
                    <label>Description</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ eventInfo["description"] }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Date</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{dateParser(eventInfo.date)}}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Time</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ timeParser(eventInfo.date) }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Capacity</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{eventInfo["capacity"]}}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Attendees</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{eventInfo["attendeeCount"]}}</p>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <label>Event type</label>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['isOnline']===1">
                    <p>Online</p>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['isOnline']===0">
                    <p>In-person</p>
                  </div>
                </div>
                <div class="row" v-if="eventInfo['isOnline']===0">
                  <div class="col-md-6">
                    <label>Venue</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ eventInfo['venue'] }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>URL</label>
                  </div>
                  <div class="col-md-6">
                    <p>{{ eventInfo['url'] }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Attendance controlled?</label>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['requiresAttendanceControl']===1">
                    <p>Yes</p>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['requiresAttendanceControl']===0">
                    <p>No</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label>Fee</label>
                  </div>
                  <div class="col-md-6" v-if="eventInfo['fee']==0">
                    <p>free</p>
                  </div>
                  <div class="col-md-6" v-else>
                    <p>${{eventInfo["fee"]}}</p>
                  </div>
                </div>
              </div>
              <div class="tab-pane fade" id="similarEvents" role="tabpanel" aria-labelledby="simEvents-tab">
                <div id="events">
                  <table>
                    <tr class="form-check-inline" v-for="event in similarEvents" v-bind:key = event.eventId>
                      <div class="event">
                        <div class="d-flex align-items-center">
                          <img v-if="event.eventImg" alt="Event Image" style="width:250px; height:250px; text-align:center; vertical-align:middle; margin-right: 50px; margin-left: 30px; margin-top: 15px;" :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'">
                          <img v-else alt="Event Image" style="width:250px; height:250px; text-align:center; vertical-align:middle; margin-right: 50px; margin-left: 30px; margin-top: 15px;" src="@/assets/noEventImg.png">
                          <div class="d-flex flex-column" align="left">
                            <h4 class="title">{{ event.title }}</h4>
                            <p class="date">Date: {{ dateParser(event.date) }}</p>
                            <p class="time">Time: {{ timeParser(event.date) }}</p>
                            <p class="organiser">Organizer: {{ event.organizerFirstName }} {{ event.organizerLastName }}</p>
                            <p class="attendees">Attendees: {{ event.numAcceptedAttendees }}</p>
                          </div>
                        </div>
                      </div>
                    </tr>
                  </table>
                </div>
              </div>
              <div class="tab-pane fade" id="attendees" role="tabpanel" aria-labelledby="simEvents-tab">
                <table class="table">
                  <thead>
                  <tr>
                    <th scope="col">Profile picture</th>
                    <th scope="col">First name</th>
                    <th scope="col">Last name</th>
                    <th scope="col" v-if="currentUserIsOrganizer">Interest date</th>
                    <th scope="col" v-if="currentUserIsOrganizer">Status</th>
                    <th scope="col" v-if="currentUserIsOrganizer">Actions</th>
                  </tr>
                  </thead>
                  <tbody v-for="attendee in attendees" v-bind:key="attendee.attendeeId">
                  <tr>
                    <th scope="row" id="attendeeImg">
                      <img v-if="attendee.imageFile!==null"  style="width:75px; height:75px; text-align:center; margin-left: 175px" :src="'http://localhost:4941/api/v1/users/' + attendee.attendeeId + '/image'">
                      <img v-else style="width:75px; height:75px; text-align:center; margin-left: 175px" src="@/assets/noprofilepic.png">
                    </th>
                    <td>{{attendee.firstName}}</td>
                    <td>{{attendee.lastName}}</td>
                    <td v-if="currentUserIsOrganizer">{{attendee.dateOfInterest}}</td>
                    <td v-if="currentUserIsOrganizer">{{attendee.status}}</td>
                    <td v-if="currentUserIsOrganizer">
                      <a class="btn btn-sq-xs btn-warning" @click="changeAttendance(attendee.attendeeId, 'pending')">
                        <i class="fa fa-question fa-1x"></i><br/>
                      </a>
                      <a class="btn btn-sq-xs btn-success" @click="changeAttendance(attendee.attendeeId, 'accepted')">
                        <i class="fa fa-check fa-1x"></i><br/>
                      </a>
                      <a class="btn btn-sq-xs btn-danger" @click="changeAttendance(attendee.attendeeId, 'rejected')">
                        <i class="fa fa-times fa-1x"></i><br/>
                      </a>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <!-- Modal -->
    <div class="modal fade" id="confirmDelete" tabindex="-1" aria-labelledby="DeleteEvent" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Delete Event</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete your event? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#confirmDelete" @click="deleteEvent">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      error: '',
      errorFlag: false,
      eventId: this.$route.params.id,
      remainingPositions: 0,
      eventInfo: [],
      allCategories: [],
      eventCategories: [],
      attendees: [],
      similarEvents: [],
      currentUserIsOrganizer: false,
      usrHasImg: false,
      eventHasImg: false,
    }
  },
  mounted() {
    this.eventId = this.$route.params.id;
    this.getEvent();
    this.getCategories();
  },
  methods: {
    async getImgs() {
      await axios.get(`http://localhost:4941/api/v1/users/${this.eventInfo["organizerId"]}/image`).then((res) => {
        console.log(`http://localhost:4941/api/v1/users/${this.eventInfo["organizerId"]}/image`)
        if (res.status === 200) {
          this.usrHasImg = true
        } else {
          this.usrHasImg = false
        }
      }).catch(() => this.usrHasImg = false);
      await axios.get(`http://localhost:4941/api/v1/events/${this.eventId}/image`).then((res) => {
        if (res.status === 200) {
          this.eventHasImg = true
        } else {
          this.eventHasImg = false
        }
      }).catch(() => this.eventHasImg = false);
    },
    dateInFuture(someDate) {
      let current = new Date();
      let parsedDate = Date.parse(someDate);
      if (current <= parsedDate) {
        return true;
      }
      return false;
    },
    async getEvent() {
      await axios.get('http://localhost:4941/api/v1/events/' + this.eventId) //http://csse-s365docker1.canterbury.ac.nz <-- Try this if needed
          .then((response) => {
            this.eventInfo = response.data;
            this.remainingPositions = (this.eventInfo["capacity"] - this.eventInfo[""])
            this.eventCategories = this.eventInfo.categories;
            if (localStorage.token !== undefined) {
              if (this.eventInfo["organizerId"] === parseInt(localStorage.userId)) {
                this.currentUserIsOrganizer = true;
              }
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
      await this.getSimilarEvents();
      await this.getAttendanceForOrganizer();
      await this.getImgs();
    },
    async getSimilarEvents() {
      let tempSearch = "";
      if (this.eventCategories.length > 0) {
        let catInd;
        for (catInd = 0; catInd < this.eventCategories.length; catInd++) {
          if (catInd > 0) {
            tempSearch = (`categoryIds=${this.eventCategories[catInd]}&` + tempSearch);
          } else {
            tempSearch += `categoryIds=${this.eventCategories[catInd]}`;
          }
        }
      }
      await axios.get('http://localhost:4941/api/v1/events?' + tempSearch)
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              if (this.eventInfo["id"] !== response.data[i]["eventId"]) {
                this.similarEvents.push(response.data[i]);
              }
            }
            for (let i = 0; i < this.similarEvents.length; i++) {
              this.getEventImg(this.similarEvents[i]["eventId"], i);
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    async getEventImg(id, ind) {
      await axios.get(`http://localhost:4941/api/v1/events/${id}/image`).then((res) => {
        if (res.status === 200) {
          this.similarEvents[ind]["eventImg"] = true;
        } else {
          this.similarEvents[ind]["eventImg"] = false;
        }
      }).catch(() => this.similarEvents[ind]["eventImg"] = false);
      return ind;
    },
    async getCategories() {
      await axios.get('http://localhost:4941/api/v1/events/categories')
          .then((response) => {
            this.allCategories = response.data;
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    getEventCategories() {
      let result = [];
      var i;
      for (i = 0; i < this.eventCategories.length; i++) {
        var j = 0;
        let found = false
        while (j < this.allCategories.length && !found) {
          if (this.allCategories[j]["id"] === this.eventCategories[i]) {
            if (i === (this.eventCategories.length - 1)) {
              result.push(this.allCategories[j]["name"]);
            } else {
              result.push(this.allCategories[j]["name"] + " ");
            }
            found = true;
          }
          j++;
        }
      }
      return result;
    },
    dateParser(date) {
      if (date === undefined || date === '') {
        return '';
      }
      let split = date.split('T');
      return split[0];
    },
    timeParser(time) {
      if (time === undefined || time === '') {
        return '';
      }
      let split = time.split('T');
      let properTime = split[1].split('.')[0];
      let splitTime = properTime.split(":");
      let hour = splitTime[0];
      let min = splitTime[1];
      let ampm = 'AM';
      if (parseInt(hour) > 12) {
        hour = (parseInt(hour) % 12).toString();
        ampm = 'PM';
      } else if (parseInt(hour) === 0) {
        hour = '12';
        ampm = 'AM';
      }
      return hour+':'+min+' '+ampm;
    },
    async getAttendanceForOrganizer() {
      const query = `SELECT event_attendees.user_id AS attendeeId, user.first_name AS firstName, user.last_name AS lastName, event_attendees.date_of_interest AS dateOfInterest, attendance_status.name AS status, user.image_filename AS imageFile FROM event_attendees JOIN user ON event_attendees.user_id=user.id JOIN attendance_status ON event_attendees.attendance_status_id=attendance_status.id WHERE event_attendees.event_id=${this.eventInfo["id"]}`
      await axios.post('http://localhost:4941/api/v1/executeSql', query, {headers: {'Content-Type': 'text/plain'}}).then((response) => {
        this.attendees = response.data;
      })
    },
    async changeAttendance(userId, status) {
      await axios.patch(`http://localhost:4941/api/v1/events/${this.eventId}/attendees/${userId}`, {status: status}, {headers: {'X-Authorization': localStorage.token}})
          .then(() => {
            this.$router.go(0);
          })
    },
    async deleteEvent() {
      await axios.delete(`http://localhost:4941/api/v1/events/${this.eventId}`, {headers: {'X-Authorization': localStorage.token}})
          .then(() => {
            this.$router.push("/events");
          })
    }
  }
}
</script>

<style scoped>
@import'~bootstrap/dist/css/bootstrap.css';
body {
  background-color: #302836;
}
.emp-profile{
  padding: 3%;
  margin-top: 3%;
  margin-bottom: 3%;
  border-radius: 0.5rem;
  background: #fff;
}
.profile-img{
  text-align: center;
}
.profile-img img{
  width: 70%;
  height: 100%;
}
.profile-img .file {
  position: relative;
  overflow: hidden;
  margin-top: -20%;
  width: 70%;
  border: none;
  border-radius: 0;
  font-size: 15px;
  background: #212529b8;
}
.profile-img .file input {
  position: absolute;
  opacity: 0;
  right: 0;
  top: 0;
}
.profile-head h5{
  color: #333;
}
.profile-head h6{
  color: #0062cc;
}
.profile-edit-btn{
  border: none;
  border-radius: 1.5rem;
  width: 70%;
  padding: 2%;
  font-weight: 600;
  color: #6c757d;
  cursor: pointer;
}
.proile-rating{
  font-size: 12px;
  color: #818182;
  margin-top: 5%;
}
.proile-rating span{
  color: #495057;
  font-size: 15px;
  font-weight: 600;
}
.profile-head .nav-tabs{
  margin-bottom:5%;
}
.profile-head .nav-tabs .nav-link{
  font-weight:600;
  border: none;
}
.profile-head .nav-tabs .nav-link.active{
  border: none;
  border-bottom:2px solid #0062cc;
}
.profile-work{
  padding: 14%;
  margin-top: -15%;
}
.profile-work p{
  font-size: 12px;
  color: #818182;
  font-weight: 600;
  margin-top: 10%;
}
.profile-work a{
  text-decoration: none;
  color: #495057;
  font-weight: 600;
  font-size: 14px;
}
.profile-work ul{
  list-style: none;
}
.simEvents-tab label{
  font-weight: 600;
}
.simEvents-tab p{
  font-weight: 600;
  color: #0062cc;
}
img {
  max-width: 300px;
  max-height: 200px;
  display: block; /* remove extra space below image */
  border-radius: 30px;
}
p {
  padding: 0;
}

#events {
  margin-top: 20px;
}

.event {
  width: 600px;
  height: 230px;
  border-style: solid;
  border-radius: 30px;
  margin-bottom: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.2s ease-in-out;
}

.event:hover {
  box-shadow: 2px 2px 5px #2c3e50;
}

p {
  margin-bottom: 0px;
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