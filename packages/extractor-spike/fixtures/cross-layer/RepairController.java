package fixture.repairs;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/repairs")
public class RepairController {
    private final RepairService service;

    public RepairController(RepairService service) { this.service = service; }

    @PostMapping("/{id}/approve")
    public void approve(@PathVariable String id) { service.approve(id); }
}
