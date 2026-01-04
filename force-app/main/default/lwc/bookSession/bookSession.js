import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import SPEAKERBIO_MC from '@salesforce/messageChannel/SpeakerBio__c';
import getSpeaker from '@salesforce/apex/SpeakerSearchController.getSpeaker';
import getAvailableSessions from '@salesforce/apex/SpeakerSearchController.getAvailableSessions';
import createAssignment from '@salesforce/apex/SpeakerSearchController.createAssignment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookSession extends LightningElement {
    @track speaker;
    speakerId;
    selectedDate;
    selectedSessionId;
    subscription = null;

    @track availableSessions = [];
    disableCreate = true;
    noSlots = false;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            SPEAKERBIO_MC,
            (message) => this.handleSpeakerSelected(message)
        );
    }

    handleSpeakerSelected(message) {
        this.speakerId = message.selectedSpeakerId;
        this.fetchSpeaker();
    }

    fetchSpeaker() {
        getSpeaker({
            speakerId: this.speakerId
        })
        .then(result => {
            if (!result)  return;
            this.speaker = result;
        })
    }

    resetState() {
        this.selectedDate = null;
        this.selectedSessionId = null;
        this.availableSessions = [];
        this.disableCreate = true;
        this.noSlots = false;
    }

    handleDateChange(event) {
        this.selectedDate = event.target.value;

        if (new Date(this.selectedDate) <= new Date()) {
            this.showToast('Error', 'Date must be in the future', 'error');
            return;
        }

        getAvailableSessions({
            speakerId: this.speakerId,
            selectedDate: this.selectedDate
        })
        .then(result => {
            console.log('result--getAvailableSessions---',JSON.stringify(result));
            this.noSlots = result.length === 0;
            if(result.length>0){
                this.availableSessions = result;
                this.disableCreate = true;
            }else{
                this.selectedSessionId = null;
                this.availableSessions = [];
                this.disableCreate = true;
                this.showToast('Error', 'All slot are already booked, try another date.', 'error');
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    get timeSlotOptions() {
        return this.availableSessions.map(session => {
            const startTime = this.formatTime(session.Start_Time__c);
            const endTime = this.formatTime(session.End_Time__c);

            return {
                label: `${session.Title__c} (${startTime} - ${endTime})`,
                value: session.Id
            };
        });
    }


    formatTime(milliseconds) {
        if (milliseconds === null || milliseconds === undefined) {
            return '';
        }

        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }


    handleSlotSelect(event) {
        this.selectedSessionId = event.target.value;
        this.disableCreate = false;
    }

    handleCreate() {
        createAssignment({
            speakerId: this.speakerId,
            sessionId: this.selectedSessionId
        })
        .then(() => {
            this.showToast(
                'Success',
                'Speaker assigned successfully',
                'success'
            );
            this.disableCreate = true;
            this.resetState();
        })
        .catch(error => {
            console.error(error);
            console.log('error--createAssignment---',JSON.stringify(error));
            let message;
            // Apex / DML / Validation errors
            if (error?.body?.pageErrors?.length) {
                message = error.body.pageErrors[0].message;
            }
            console.log('eroor message----',message);
            this.showToast('Error',message,'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}