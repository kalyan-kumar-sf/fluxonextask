public class SpeakerAssignmentTriggerHandler {
    
    public static void validateSpeakerAvailability(List<Speaker_Assignment__c> saNewList, Map<Id, Speaker_Assignment__c> saOldMap){
        Set<Id> speakerIds = new Set<Id>();
        Set<Id> sessionIds = new Set<Id>();
        for (Speaker_Assignment__c sa : saNewList) {
            if (sa.Speaker__c != null && sa.Session__c != null) {
                speakerIds.add(sa.Speaker__c);
                sessionIds.add(sa.Session__c);
            }
        }
        
        if (speakerIds.isEmpty() || sessionIds.isEmpty()) return;
        
        Map<Id, Session__c> sessionsMap = new Map<Id, Session__c>([SELECT Id, Session_Date__c, Start_Time__c, End_Time__c FROM Session__c 
                                                                      WHERE Id IN :sessionIds]);
        
        List<Speaker_Assignment__c> existingAssignments = [SELECT Id, Speaker__c, Session__c, Session__r.Session_Date__c, Session__r.Start_Time__c, Session__r.End_Time__c FROM Speaker_Assignment__c 
                                                           WHERE Speaker__c IN :speakerIds AND Id NOT IN :saNewList];
        
        Map<Id, List<Speaker_Assignment__c>> speakerToAssignmentsMap = new Map<Id, List<Speaker_Assignment__c>>();
        
        for (Speaker_Assignment__c sa : existingAssignments) {
            if (!speakerToAssignmentsMap.containsKey(sa.Speaker__c)) {
                speakerToAssignmentsMap.put(sa.Speaker__c, new List<Speaker_Assignment__c>());
            }
            speakerToAssignmentsMap.get(sa.Speaker__c).add(sa);
        }
        
        // Validate overlap
        for (Speaker_Assignment__c sa : saNewList) {
            Session__c currentSession = sessionsMap.get(sa.Session__c);
            if (currentSession == null) continue;
            
            List<Speaker_Assignment__c> assignedSessions = speakerToAssignmentsMap.get(sa.Speaker__c);
            
            if (assignedSessions == null) continue;
            
            for (Speaker_Assignment__c existingSA : assignedSessions) {
                Session__c existingSession = existingSA.Session__r;
                
                if (existingSession.Session_Date__c == currentSession.Session_Date__c) {
                    
                    Boolean isOverlapping = currentSession.Start_Time__c < existingSession.End_Time__c && currentSession.End_Time__c > existingSession.Start_Time__c;
                    system.debug('isOverlapping----'+isOverlapping);
                    if (isOverlapping) {
                        sa.addError('Speaker is already booked for this time.');
                        break;
                    }
                }
            }
        }
    }
}