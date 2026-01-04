trigger SpeakerAssignmentTrigger on Speaker_Assignment__c (before insert, before update, before delete, after insert, after update, after delete, after undelete){
    if (Trigger.isBefore && Trigger.isInsert){
        SpeakerAssignmentTriggerHandler.validateSpeakerAvailability(Trigger.new, null);
        system.debug('before insert sa----'+Trigger.new);
    }else if(Trigger.isBefore && Trigger.isUpdate){
        system.debug('before update sa----'+Trigger.new);
        SpeakerAssignmentTriggerHandler.validateSpeakerAvailability(Trigger.new, Trigger.oldMap);
    }   
}