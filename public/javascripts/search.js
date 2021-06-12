var vueSearch = new Vue({
    el: '#Search',
    data: {
        UserSearch: false,
        VenueSearch: true,
    }
});

function UserVis(){
    vueSearch.UserSearch=false;
    vueSearch.VenueSearch=true;
}

function VenueVis(){
    vueSearch.UserSearch=true;
    vueSearch.VenueSearch=false;
}