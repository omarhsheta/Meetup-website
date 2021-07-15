<template>
  <div class="vh-100 vw-100" :style="{'background-image': `url(${require('@/assets/event2.jpg')})`, 'background-size': 'cover', 'paddingTop': '30px'}">
    <div v-if="session!==undefined">
      <div class="container mt-5 d-flex justify-content-center">
        <div class="card p-3">
          <div class="d-flex align-items-center">
            <div class="image" v-if="imgFound"> <img :src="'http://localhost:4941/api/v1/users/'+userId+'/image'" class="rounded" width="155"> </div>
            <div class="image" v-else> <img src="@/assets/noprofilepic.png" class="rounded" width="155"> </div>
            <div class="ml-3 w-100">
              <h4 class="mb-0 mt-0">{{ firstName }} {{ lastName }}</h4>
              <h6 class="mb-0 mt-0">{{ email }}</h6>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <div class="column">
            <h2>Events you are hosting</h2>
            <ul class="event-list" v-for="event in myOrgEvents" v-bind:key = event.eventId>
              <li class="event">
                <time datetime="1881-05-19">
                  <span class="day">{{dateParser(event.date).split('-')[2]}}</span>
                  <span class="month">{{getMonth(parseInt(dateParser(event.date).split('-')[1]))}}</span>
                  <span class="year">{{dateParser(event.date).split('-')[0]}}</span>
                  <span class="time">Tüm Gün</span>
                </time>
                <img alt="Hero Image" :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'" />
                <div class="info">
                  <h2 class="title">{{ event.title }}</h2>
                  <p class="desc">By {{ event.organizerFirstName }} {{ event.organizerLastName }}</p>
                  <p class="desc">{{getEventCategories(event.categories)}}</p>
                  <ul>
                    <li style="width:34%;"><span class="time">{{ timeParser(event.date) }}</span></li>
                    <li style="width:33%;">{{event.numAcceptedAttendees}}  <span class="fa fa-male"></span></li>
                  </ul>
                </div>
                <div class="social">
                  <ul>
                    <li class="edit" @click="eventDetails(event.eventId)"><a><span class="fa fa-info-circle"></span></a></li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
          <div class="column">
            <h2>Events you are attending</h2>
            <ul class="event-list" v-for="event in events" v-bind:key = event.eventId>
              <li class="event" v-if="myOtherEvents.includes(event.eventId)">
                <time datetime="1881-05-19">
                  <span class="day">{{dateParser(event.date).split('-')[2]}}</span>
                  <span class="month">{{getMonth(parseInt(dateParser(event.date).split('-')[1]))}}</span>
                  <span class="year">{{dateParser(event.date).split('-')[0]}}</span>
                  <span class="time">Tüm Gün</span>
                </time>
                <img alt="Hero Image" :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'" />
                <div class="info">
                  <h2 class="title">{{ event.title }}</h2>
                  <p class="desc">By {{ event.organizerFirstName }} {{ event.organizerLastName }}</p>
                  <p class="desc">{{getEventCategories(event.categories)}}</p>
                  <ul>
                    <li style="width:34%;"><span class="time">{{ timeParser(event.date) }}</span></li>
                    <li style="width:33%;">{{event.numAcceptedAttendees}}  <span class="fa fa-male"></span></li>
                  </ul>
                </div>
                <div class="social">
                  <ul>
                    <li class="edit" style="width:33%;" @click="eventDetails(event.eventId)"><a><span class="fa fa-info-circle"></span></a></li>
                    <li class="disabled" style="width:34%;"><a><span class="fa fa-check disabled"></span></a></li>
                    <li class="delete" style="width:33%;" @click="leaveEvent(event.eventId)"><a><span class="fa fa-times"></span></a></li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-else><h1 style="padding-top: 200px; font-size: 100px; text-shadow: 0 0 30px orchid; color: #b9b3bb;">Welcome to Meetup!</h1></div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'App',
  data() {
    return {
      session: undefined,
      userId: undefined,
      firstName: "",
      lastName: "",
      email: "",
      imgFound: false,
      events: [],
      myOrgEvents: [],
      myOtherEvents: [],
      categories: []
    }
  },
  mounted() {
    if (localStorage.token) {
      this.session = localStorage.token;
      this.userId = localStorage.userId;
      this.email = localStorage.email;
      this.getNames();
      this.getImage();
      this.getCategories();
      this.getEvents();
      this.getAttendingEvents();
    }
  },
  methods: {
    getNames() {
      axios.get('http://localhost:4941/api/v1/users/'+localStorage.userId)
          .then((response) => {
            localStorage.firstName = response.data["firstName"];
            localStorage.lastName = response.data["lastName"];
            this.firstName = localStorage.firstName;
            this.lastName = localStorage.lastName;
          });
    },
    getImage() {
    axios.get(`http://localhost:4941/api/v1/users/${this.userId}/image`).then((response) => {
       if (response.status === 200) {
         this.imgFound = true;
       }
     });
    },
    getEvents() {
      axios.get(`http://localhost:4941/api/v1/events`).then((response) => {
        let tempData = [];
        for (let i = 0; i < response.data.length; i++) {
          this.events = response.data;
          if (response.data[i]["organizerFirstName"] === this.firstName && response.data[i]["organizerLastName"] === this.lastName) {
            this.myOrgEvents.push(response.data[i])
            tempData.push(response.data[i]["eventId"])
          }
        }
        localStorage.organizing = tempData;
      });
    },
    getAttendingEvents() {
      let query = `SELECT event_id FROM event_attendees WHERE user_id=${this.userId}`;
      axios.post('http://localhost:4941/api/v1/executeSql', query, {headers: {'Content-Type': 'text/plain'}}).then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.myOtherEvents.push(response.data[i]["event_id"])
        }
        localStorage.attending = this.myOtherEvents;
      })
    },
    dateParser(date) {
      let split = date.split('T');
      return split[0];
    },
    timeParser(time) {
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
    getCategories() {
      axios.get('http://localhost:4941/api/v1/events/categories')
          .then((response) => {
            this.categories = response.data;
            var i;
            for (i = 0; i < this.categories.length; i++) {
              this.categories[0]["checked"] = false;
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    getEventCategories(ids) {
      let result = "";
      var i;
      for (i = 0; i < ids.length; i++) {
        var j = 0;
        if (i === (ids.length - 1)) {
          let found = false
          while (j < this.categories.length && !found) {
            if (this.categories[j]["id"] === ids[i]) {
              result += (this.categories[j]["name"]);
              found = true;
            }
            j++;
          }
        } else {
          let found = false
          while (j < this.categories.length && !found) {
            if (this.categories[j]["id"] === ids[i]) {
              result += (this.categories[j]["name"] + " ");
              found = true;
            }
            j++;
          }
        }
      }
      return result;
    },
    getMonth(num) {
      let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      return months[num-1]
    },
    eventDetails(eventId) {
      this.$router.push("/event/"+eventId)
    },
    leaveEvent(eventId) {
      axios.delete('http://localhost:4941/api/v1/events/'+eventId+'/attendees',  {headers: {'X-Authorization': localStorage.token}})
          .then(() => {
            this.$router.go(0);
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    }
  }
}
</script>

<style>
body {
  background-color: #302836;
}

.card {
  width: 400px;
  border: none;
  border-radius: 10px;
  /*background-color: #fff*/
}
@import url("http://fonts.googleapis.com/css?family=Lato:100,300,400,700,900,400italic");
@import url("//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.css");

.event-list {
  list-style: none;
  font-family: 'Lato', sans-serif;
  margin: 0px;
  padding: 0px;
}
.event-list > li {
  background-color: rgb(255, 255, 255);
  box-shadow: 0px 0px 5px rgb(51, 51, 51);
  box-shadow: 0px 0px 5px rgba(51, 51, 51, 0.7);
  padding: 0px;
  margin: 0px 0px 20px;
}
.event-list > li > time {
  display: inline-block;
  width: 100%;
  color: rgb(255, 255, 255);
  background-color: rgb(197, 44, 102);
  padding: 5px;
  text-align: center;
  text-transform: uppercase;
}
.event-list > li:nth-child(even) > time {
  background-color: rgb(165, 82, 167);
}
.event-list > li > time > span {
  display: none;
}
.event-list > li > time > .day {
  display: block;
  font-size: 40pt;
  font-weight: 100;
  line-height: 1;
}
.event-list > li time > .month {
  display: block;
  font-size: 16pt;
  font-weight: 500;
  line-height: 1;
}
.event-list > li time > .year {
  display: block;
  font-size: 24pt;
  font-weight: 500;
  line-height: 1;
}
.event-list > li > img {
  width: 100%;
}
.event-list > li > .info {
  padding-top: 5px;
  text-align: center;
}
.event-list > li > .info > .title {
  font-size: 16pt;
  font-weight: 700;
  margin: 0px;
}
.event-list > li > .info > .desc {
  font-size: 12pt;
  font-weight: 300;
  margin: 0px;
}
.event-list > li > .info > ul,
.event-list > li > .social > ul {
  display: table;
  list-style: none;
  margin: 10px 0px 0px;
  padding: 0px;
  width: 100%;
  text-align: center;

}
.event-list > li > .social > ul {
  margin: 0px;
}
.event-list > li > .info > ul > li,
.event-list > li > .social > ul > li {
  display: table-cell;
  cursor: pointer;
  color: rgb(30, 30, 30);
  font-size: 11pt;
  font-weight: 300;
  padding: 3px 0px;
}
.event-list > li > .info > ul > li > a {
  display: block;
  width: 100%;
  color: rgb(30, 30, 30);
  text-decoration: none;
}
.event-list > li > .social > ul > li {
  padding: 0px;
}
.event-list > li > .social > ul > li > a {
  padding: 3px 0px;
}
.event-list > li > .info > ul > li:hover,
.event-list > li > .social > ul > li:hover {
  color: rgb(30, 30, 30);
  background-color: rgb(200, 200, 200);
}
.edit a,
.confirm a,
.delete a {
  display: block;
  width: 100%;
  color: rgb(75, 110, 168) !important;
}
.confirm a {
  color: rgb(79, 213, 248) !important;
}
.delete a {
  color: rgb(221, 75, 57) !important;
}
.edit:hover a {
  color: rgb(255, 255, 255) !important;
  background-color: rgb(75, 110, 168) !important;
}
.confirm:hover a {
  color: rgb(255, 255, 255) !important;
  background-color: rgb(79, 213, 248) !important;
}
.delete:hover a {
  color: rgb(255, 255, 255) !important;
  background-color: rgb(221, 75, 57) !important;
}

@media (min-width: 768px) {
  .event-list > li {
    position: relative;
    display: block;
    width: 100%;
    height: 120px;
    padding: 0px;
  }
  .event-list > li > time,
  .event-list > li > img  {
    display: inline-block;
  }
  .event-list > li > time,
  .event-list > li > img {
    width: 120px;
    float: left;
  }
  .event-list > li > .info {
    background-color: rgb(245, 245, 245);
    overflow: hidden;
  }
  .event-list > li > time,
  .event-list > li > img {
    width: 120px;
    height: 120px;
    padding: 0px;
    margin: 0px;
  }
  .event-list > li > .info {
    position: relative;
    height: 120px;
    text-align: left;
    padding-right: 40px;
  }
  .event-list > li > .info > .title,
  .event-list > li > .info > .desc {
    padding: 0px 10px;
  }
  .event-list > li > .info > ul {
    position: absolute;
    left: 0px;
    bottom: 0px;
  }
  .event-list > li > .social {
    position: absolute;
    top: 0px;
    right: 0px;
    display: block;
    width: 40px;
  }
  .event-list > li > .social > ul {
    border-left: 1px solid rgb(230, 230, 230);
  }
  .event-list > li > .social > ul > li {
    display: block;
    padding: 0px;
  }
  .event-list > li > .social > ul > li > a {
    display: block;
    width: 40px;
    padding: 10px 0px 9px;
  }
  .row {
    display: flex;
  }

  .column {
    flex: 50%;
  }
  .disabled {
    pointer-events:none;
    opacity:0.6;
  }
  .event {
    opacity: 0.80;
    transition: all 0.8s ease-in-out;
  }
  .event:hover {
    opacity: 1;
  }

}
</style>
