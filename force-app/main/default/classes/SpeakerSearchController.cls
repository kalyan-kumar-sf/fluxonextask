public class SpeakerSearchController {
	@AuraEnabled(cacheable=true)
    public static List<Speaker__c> searchSpeakers(String name, String speciality) {
        String soql = 'SELECT Id, Name, Email__c, Bio__c, Speciality__c FROM Speaker__c WHERE Id != null';

        if (String.isNotBlank(name)) {
            soql += ' AND Name LIKE \'%' + String.escapeSingleQuotes(name) + '%\'';
        }
        if (String.isNotBlank(speciality)) {
            soql += ' AND Speciality__c = :speciality';
        }

        return Database.query(soql);
    }

    @AuraEnabled
    public static Speaker__c getSpeaker(Id speakerId) {
        Speaker__c speaker = [SELECT Id, Name, Email__c, Bio__c, Speciality__c FROM Speaker__c WHERE Id = :speakerId];
        return speaker;
    }

    @AuraEnabled(cacheable=true)
    public static List<Session__c> getAvailableSessions(
        Id speakerId,
        Date selectedDate
    ) {
        List<Session__c> sessionsOnDate = [
            SELECT Id, Title__c, Start_Time__c, End_Time__c
            FROM Session__c
            WHERE Session_Date__c = :selectedDate
            AND Session_Date__c >= TODAY
            ORDER BY Start_Time__c
        ];

        if (sessionsOnDate.isEmpty()) {
            return new List<Session__c>();
        }

        Set<Id> bookedSessionIds = new Set<Id>();

        for (Speaker_Assignment__c sa : [
            SELECT Session__c
            FROM Speaker_Assignment__c
            WHERE Speaker__c = :speakerId
            AND Session__r.Session_Date__c = :selectedDate
        ]) {
            bookedSessionIds.add(sa.Session__c);
        }

        //Filter available sessions
        List<Session__c> availableSessions = new List<Session__c>();
        for (Session__c session : sessionsOnDate) {
            if (!bookedSessionIds.contains(session.Id)) {
                availableSessions.add(session);
            }
        }

        return availableSessions;
    }

    @AuraEnabled
    public static void createAssignment(Id speakerId, Id sessionId) {
        insert new Speaker_Assignment__c(
            Speaker__c = speakerId,
            Session__c = sessionId
        );
    }
}