package fixture.repairs;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "repair_request")
public class RepairRequest {
    @Id public String id;
    @Column(name = "status") public String status;
}
