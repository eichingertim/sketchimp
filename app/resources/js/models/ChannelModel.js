class ChannelModel {

    constructor(channelId, channelName, creatorId, creatorName, creationDate, members, channelIcon) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.creationDate = creationDate;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.members = members;
        this.currentSketch = null;
        this.channelIcon = channelIcon;
    }

}

export default ChannelModel;