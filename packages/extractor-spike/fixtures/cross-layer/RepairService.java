package fixture.repairs;

public class RepairService {
    private final RepairRepository repository;

    public RepairService(RepairRepository repository) { this.repository = repository; }

    public void approve(String id) {
        RepairRequest request = repository.find(id);
        if (!"PENDING".equals(request.status)) throw new IllegalStateException("Not pending");
        request.status = "APPROVED";
        repository.save(request);
    }
}

interface RepairRepository {
    RepairRequest find(String id);
    void save(RepairRequest request);
}
