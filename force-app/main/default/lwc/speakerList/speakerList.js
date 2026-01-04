import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import SPEAKERBIO_MC from '@salesforce/messageChannel/SpeakerBio__c';

export default class SpeakerList extends LightningElement {
    @api speakers;

    @wire(MessageContext)
    messageContext;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Email', fieldName: 'Email__c' },
        { label: 'Speciality', fieldName: 'Speciality__c' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Book Session',
                name: 'book',
                variant: 'brand'
            }
        }
    ];

    handleRowAction(event) {
        const speakerId = event.detail.row.Id;

        publish(this.messageContext, SPEAKERBIO_MC, {
            selectedSpeakerId: speakerId
        });
    }
}