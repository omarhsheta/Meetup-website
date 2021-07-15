<template>
  <div :style="{'background-image': `url(${require('@/assets/event2.jpg')})`, 'background-repeat':'repeat', 'background-attachment':'fixed', 'background-position':'center top', 'background-size':'cover', 'paddingBottom': '100px'}">
    <h1 style="font-size: 75px; text-shadow: 0 0 30px orchid; color: #b9b3bb;">Events</h1>
    <form @submit.prevent="getEventsParams">
      <input type="search" placeholder="Search for user" name="search" v-model="search">
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>
    <p>
      <button class="btn btn-outline-success my-2 my-sm-0" @click="toggleCategoriesView">Show categories</button>
    </p>
    <div class="container" id="categories" v-bind:style="{'display': (catToggled? 'inline-block' : 'none')}">
      <form class="form-check-inline" v-for="category in categories" v-bind:key = category.id>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" :id="category.id" :value="category.name" @click="toggleCategory(category.id)">
          <label class="form-check-label" :for="category.id">{{category.name}}</label>
        </div>
      </form>
    </div>

    <p>
      <button class="btn btn-outline-success my-2 my-sm-0" @click="toggleSortByView">Sort by</button>
    </p>
    <div class="container" id="sorting" v-bind:style="{'display': (sortToggled? 'inline-block' : 'none')}">
      <form class="form-check-inline">
        <div class="form-check form-check-inline">
          <input class="form-check-input" name="sort" type="radio" id="attendeeAsc" v-on:click="toggleAttendeeAsc">
          <label class="form-check-label" for="attendeeAsc">Attendees - Asc</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" name="sort" type="radio" id="attendeeDesc" v-on:click="toggleAttendeeDesc">
          <label class="form-check-label" for="attendeeDesc">Attendees - Desc</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" name="sort" type="radio" id="dateAsc" v-on:click="toggleDateAsc">
          <label class="form-check-label" for="dateAsc">Date - Asc</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" name="sort" type="radio" id="dateDesc" v-on:click="toggleDateDesc">
          <label class="form-check-label" for="dateDesc">Date - Desc</label>
        </div>
      </form>
    </div>

    <div id="events">
      <div class="row">
        <h5 style="text-shadow: 0 0 30px orchid; color: #b9b3bb;" align="left">Showing page {{currentPage+1}} out of {{events.length}} pages</h5>
        <tr class="event-list" v-for="event in events[currentPage]" v-bind:key = event.eventId>
          <li id="event" v-if="dateInFuture(event.date)">
            <time datetime="1881-05-19">
              <span class="day">{{dateParser(event.date).split('-')[2]}}</span>
              <span class="month">{{getMonth(parseInt(dateParser(event.date).split('-')[1]))}}</span>
              <span class="year">{{dateParser(event.date).split('-')[0]}}</span>
              <span class="time">Tüm Gün</span>
            </time>
            <img alt="Hero Image" :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'" v-if="getEventDetails(event.eventId).eventImg"/>
            <img alt="Hero Image" src="@/assets/noEventImg.png" v-else/>
            <img alt="Organizer" :src="'http://localhost:4941/api/v1/users/' + getEventDetails(event.eventId).organizer + '/image'" v-if="getEventDetails(event.eventId).organizerImg"/>
            <img alt="Organizer" src="@/assets/noprofilepic.png" v-else/>
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
              <ul v-if="sessionOrg.includes(event.eventId)||!dateInFuture(event.date)">
                <li class="edit" style="width:33%;" @click="eventDetails(event.eventId)"><a data-toggle="tooltip" title="See more info!"><span class="fa fa-info-circle"></span></a></li>
              </ul>
              <ul v-else-if="sessionAttendance.includes(event.eventId)">
                <li class="edit" style="width:33%;" @click="eventDetails(event.eventId)"><a data-toggle="tooltip" title="See more info!"><span class="fa fa-info-circle"></span></a></li>
                <li class="disabled" style="width:34%;"><a><span class="fa fa-check"></span></a></li>
                <li class="delete" style="width:33%;" @click="leaveEvent(event.eventId)"><a data-toggle="tooltip" title="Leave the event!"><span class="fa fa-times"></span></a></li>
              </ul>
              <ul v-else>
                <li class="edit" style="width:33%;" @click="eventDetails(event.eventId)"><a data-toggle="tooltip" title="See more info!"><span class="fa fa-info-circle"></span></a></li>
                <li class="disabled" style="width:34%;" v-if="(event.capacity-event.numAcceptedAttendees) === 0"><a><span class="fa fa-check"></span></a></li>
                <li class="confirm" style="width:34%;" @click="joinEvent(event.eventId)" v-else><a data-toggle="tooltip" title="Join the event!"><span class="fa fa-check"></span></a></li>
                <li class="disabled" style="width:33%;"><a><span class="fa fa-times"></span></a></li>
              </ul>
            </div>
          </li>
        </tr>
        <h5 v-if="currentPage===events.length-1&&currentPage!==0" style="text-shadow: 0 0 30px orchid; color: #b9b3bb;" align="left">No more events can be found!</h5>
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item"><a class="page-link" href="#" v-on:click="setPage(0)">«</a></li>
            <li class="page-item"><a class="page-link" href="#" v-on:click="setPage(currentPage-1)">‹</a></li>
            <ul class="pagination" v-for="n in events.length" v-bind:key = n ><li class="page-item"><a class="page-link" href="#" v-on:click="setPage(n-1)">{{ n }}</a></li></ul>
            <li class="page-item"><a class="page-link" href="#" v-on:click="setPage(currentPage+1)">›</a></li>
            <li class="page-item"><a class="page-link" href="#" v-on:click="setPage(currentPage+1)">»</a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import 'bootstrap/dist/js/bootstrap.bundle';
export default {
  data() {
    return{
      error: "",
      errorFlag: false,
      currSesh: false,
      events: [],
      categories: [],
      categoryParams: [],
      sessionAttendance: [],
      sessionOrg: [],
      search: "",
      catToggled: false,
      sortToggled: false,
      attendeesAsc: false,
      attendeesDesc: false,
      dateAsc: false,
      dateDesc: false,
      currentPage: 0,
      eventParams: [],
      tempList: []
    }
  },
  computed: {
    rows() {
      return this.events.length
    }
  },
  mounted() {
    this.getEventsParams();
    this.getCategories();
    if (localStorage.token) {
      this.currSesh = true;
      if (localStorage.attending.length === 1) {
        this.sessionAttendance.push(parseInt(localStorage.attending))
      } else if (localStorage.attending.length > 1) {
        let temp = localStorage.attending.split(",");
        for (let i = 0; i < temp.length; i++) {
          this.sessionAttendance.push(parseInt(temp[i]))
        }
      }

      if (localStorage.organizing.length === 1) {
        this.sessionOrg.push(parseInt(localStorage.organizing))
      } else if (localStorage.organizing.length > 1) {
        let temp = localStorage.organizing.split(",");
        for (let i = 0; i < temp.length; i++) {
          this.sessionOrg.push(parseInt(temp[i]))
        }
      }
    }
  },
  methods: {
    getMonth(num) {
      let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      return months[num-1]
    },
    async getEvents() {
      this.events = [];
      await axios.get('http://localhost:4941/api/v1/events') //http://csse-s365docker1.canterbury.ac.nz <-- Try this if needed
          .then((response) => {
            if (response.data.length > 10) {
              let tempList = response.data;
              this.tempList = response.data;
              for (let ev = 0; ev < this.tempList.length; ev++) {
                this.eventDetailsObtainer(this.tempList[ev]["eventId"])
              }
              let currentChunk = 0
              while (currentChunk < response.data.length) {
                this.events.push(tempList.slice(currentChunk, currentChunk+10));
                currentChunk = currentChunk + 10;
              }
            } else {
              this.events = [response.data];
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    dateInFuture(someDate) {
      let current = new Date();
      let parsedDate = Date.parse(someDate);
      if(current <= parsedDate) {
        return true;
      }
      return false;
    },
    async getEventsParams() {
      this.events = [];
      this.findCategoryParams();
      this.currentPage = 0;
      if (this.search === "" && this.categoryParams.length === 0 && !this.attendeesAsc && !this.attendeesDesc && !this.dateAsc && !this.dateDesc) {
        await this.getEvents();
      } else {
        let tempSearch = "";
        if (this.categoryParams.length > 0) {
          let catInd;
          for (catInd = 0; catInd < this.categoryParams.length; catInd++) {
            if (catInd > 0) {
              tempSearch = (`categoryIds=${this.categoryParams[catInd]}&` + tempSearch);
            } else {
              tempSearch += `categoryIds=${this.categoryParams[catInd]}`;
            }
          }
        }
        if (this.search !== "") {
          tempSearch = (`q=${this.search}&` + tempSearch)
        }
        if (this.dateAsc) {
          tempSearch += "&sortBy=DATE_ASC";
        } else if (this.dateDesc) {
          tempSearch += "&sortBy=DATE_DESC";
        }
        this.categoryParams = [];
        await axios.get('http://localhost:4941/api/v1/events?' + tempSearch)
            .then((response) => {
              let tempList = response.data;
              this.tempList = response.data;
              for (let ev = 0; ev < this.tempList.length; ev++) {
                this.eventDetailsObtainer(this.tempList[ev]["eventId"])
              }
              if (response.data.length > 10) {
                if (this.attendeesAsc) {
                  tempList.sort((a, b) => (a.numAcceptedAttendees > b.numAcceptedAttendees) ? 1 : -1)
                }
                if (this.attendeesDesc) {
                  tempList.sort((a, b) => (a.numAcceptedAttendees < b.numAcceptedAttendees) ? 1 : -1)
                }
                let currentChunk = 0
                while (currentChunk < response.data.length) {
                  this.events.push(tempList.slice(currentChunk, currentChunk+10));
                  currentChunk = currentChunk + 10;
                }
              } else {
                this.events = [response.data];
              }
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      }
    },
    async getCategories() {
      await axios.get('http://localhost:4941/api/v1/events/categories')
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
    async eventDetailsObtainer(id) {
      await axios.get('http://localhost:4941/api/v1/events/'+id)
          .then((response) => {
            this.eventParams.push({eventId: id, organizer: response.data.organizerId, organizerImg: false, eventImg: false})
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
      let len = this.eventParams.length-1;
      await this.getUsrImg(this.eventParams[len]["organizer"], len)
      await this.getEventImg(this.eventParams[len]["eventId"], len)
    },
    async getUsrImg(id, val) {
      await axios.get(`http://localhost:4941/api/v1/users/${id}/image`).then((res) => {
        if (res.status === 200) {
          this.eventParams[val]["organizerImg"] = true;
        } else {
          this.eventParams[val]["organizerImg"] = false;
        }
      }).catch(() => this.eventParams[val]["organizerImg"] = false);
      return val;
    },
    async getEventImg(id, val) {
      await axios.get(`http://localhost:4941/api/v1/events/${id}/image`).then((res) => {
        if (res.status === 200) {
          this.eventParams[val]["eventImg"] = true;
        } else {
          this.eventParams[val]["eventImg"] = false;
        }
      }).catch(() => this.eventParams[val]["eventImg"] = false);
      return val;
    },
    getEventDetails(id) {
      let i = 0;
      while (i < this.eventParams.length) {
        if (this.eventParams[i].eventId === id) {
          break;
        }
        i++
      }
      return this.eventParams[i];
    },
    toggleCategoriesView() {
      this.catToggled = !this.catToggled;
    },
    toggleSortByView() {
      this.sortToggled = !this.sortToggled;
    },
    toggleCategory(catId) {
      let i;
      for (i = 0; i < this.categories.length; i++) {
        if (this.categories[i]["id"] == catId) {
          this.categories[i]["checked"] = !this.categories[i]["checked"];
        }
      }
    },
    findCategoryParams() {
      let catInd
      for (catInd in this.categories) {
        if (this.categories[catInd]["checked"]) {
          this.categoryParams.push(this.categories[catInd]["id"]);
        }
      }
    },
    setPage(num) {
      if (num < 0) {
        num = 0;
      } else if (num >= this.events.length) {
        num = this.events.length-1;
      } else {
        this.currentPage = num;
      }
    },
    toggleAttendeeAsc() {
      this.attendeesAsc = true;
      this.attendeesDesc = false;
      this.dateAsc = false;
      this.dateDesc = false;
    },
    toggleAttendeeDesc() {
      this.attendeesAsc = false;
      this.attendeesDesc = true;
      this.dateAsc = false;
      this.dateDesc = false;
    },
    toggleDateAsc() {
      this.dateAsc = true;
      this.attendeesAsc = false;
      this.attendeesDesc = false;
      this.dateDesc = false;
    },
    toggleDateDesc() {
      this.dateDesc = true;
      this.attendeesAsc = false;
      this.attendeesDesc = false;
      this.dateAsc = false;
    },
    eventDetails(eventId) {
      this.$router.push("/event/"+eventId)
    },
    joinEvent(eventId) {
      if (this.currSesh) {
        axios.post('http://localhost:4941/api/v1/events/'+eventId+'/attendees', {}, {headers: {'X-Authorization': localStorage.token}})
            .then(() => {
              this.$router.push("/");
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      } else {
        this.$router.push("/login");
      }
    },
    leaveEvent(eventId) {
      axios.delete('http://localhost:4941/api/v1/events/'+eventId+'/attendees',  {headers: {'X-Authorization': localStorage.token}})
          .then(() => {
            this.$router.push("/");
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
  font-size: 17pt;
  font-weight: 700;
  margin: 0px;
}
.event-list > li > .info > .desc {
  font-size: 13pt;
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
    padding-left: 50px;
    padding-right: 50px;
  }

  .column {
    flex: 50%;
  }
  .disabled {
    pointer-events:none;
    opacity:0.6;
  }
  #event {
   opacity: 0.70;
    transition: all 0.8s ease-in-out;
  }
  #event:hover {
    opacity: 1;
  }
  div > background-image {
    position: fixed;
  }
}
</style>