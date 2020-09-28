class ChannelModel {

    constructor(channelId, channelName, creatorId, creatorName, creationDate, members) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.creationDate = creationDate;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.members = members;
        this.currentSketch = null;
    }

}

export default ChannelModel;