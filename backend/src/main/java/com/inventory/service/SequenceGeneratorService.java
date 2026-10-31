package com.inventory.service;

import com.inventory.entity.DatabaseSequence;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SequenceGeneratorService {

    private final MongoOperations mongoOperations;

    public long generateSequence(String seqName) {
        Query query = new Query(Criteria.where("_id").is(seqName));
        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions options = FindAndModifyOptions.options().returnNew(true).upsert(true);

        DatabaseSequence counter = mongoOperations.findAndModify(query, update, options, DatabaseSequence.class);
        return counter != null ? counter.getSeq() : 1L;
    }

    public void updateSequenceIfGreater(String seqName, long currentId) {
        DatabaseSequence existing = mongoOperations.findById(seqName, DatabaseSequence.class);
        if (existing == null) {
            mongoOperations.save(new DatabaseSequence(seqName, currentId));
        } else if (existing.getSeq() < currentId) {
            Query query = new Query(Criteria.where("_id").is(seqName));
            Update update = new Update().set("seq", currentId);
            mongoOperations.updateFirst(query, update, DatabaseSequence.class);
        }
    }
}
