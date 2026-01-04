import { LightningElement, track } from 'lwc';
import searchSpeakers from '@salesforce/apex/SpeakerSearchController.searchSpeakers';

export default class SpeakerSearch extends LightningElement {
    name = '';
    speciality = '';
    @track speakers = [];

    specialityOptions = [
        { label: 'Apex', value: 'Apex' },
        { label: 'LWC', value: 'LWC' },
        { label: 'Integrations', value: 'Integrations' },
        { label: 'Architecture', value: 'Architecture' }
    ];

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleSpecialityChange(event) {
        this.speciality = event.target.value;
    }

    handleSearch() {
        searchSpeakers({ name: this.name, speciality: this.speciality })
            .then(result => {
                this.speakers = result;
            })
            .catch(error => {
                console.error(error);
            });
    }
}